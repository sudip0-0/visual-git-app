use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};

use flate2::read::ZlibDecoder;

use crate::errors::AppError;
use crate::models::internals::LooseCommitObject;

const MAX_LOOSE_OBJECT_BYTES: u64 = 2_000_000;
const MAX_DECOMPRESSED_OBJECT_BYTES: u64 = 4_000_000;

pub struct LooseObjectParser {
    git_dir: PathBuf,
}

struct ParsedLooseObject {
    object_type: String,
    declared_size: usize,
    content: Vec<u8>,
}

impl LooseObjectParser {
    pub fn new(git_dir: PathBuf) -> Self {
        Self { git_dir }
    }

    pub fn parse_commit(&self, commit_hash: &str) -> Result<LooseCommitObject, AppError> {
        let hash = normalize_object_hash(commit_hash)?;
        let object_path = loose_object_path(&self.git_dir, hash);
        let display_path = object_path.to_string_lossy().into_owned();

        if !object_path.exists() {
            return Ok(LooseCommitObject {
                object_path: display_path,
                is_available: false,
                object_type: None,
                declared_size: None,
                tree_hash: None,
                parent_hashes: Vec::new(),
                author: None,
                committer: None,
                message: None,
                explanation: "This object is not loose on disk. It may be stored in a packfile, which this educational parser does not read yet.".to_owned(),
            });
        }

        let parsed = read_loose_object(&object_path)?;
        if parsed.object_type != "commit" {
            return Ok(LooseCommitObject {
                object_path: display_path,
                is_available: true,
                object_type: Some(parsed.object_type),
                declared_size: Some(parsed.declared_size),
                tree_hash: None,
                parent_hashes: Vec::new(),
                author: None,
                committer: None,
                message: None,
                explanation: "The loose object was found, but it is not a commit object."
                    .to_owned(),
            });
        }

        let content = String::from_utf8_lossy(&parsed.content);
        let (headers, message) = split_commit_content(&content);
        let mut tree_hash = None;
        let mut parent_hashes = Vec::new();
        let mut author = None;
        let mut committer = None;

        for line in headers.lines() {
            if let Some(value) = line.strip_prefix("tree ") {
                tree_hash = Some(value.to_owned());
            } else if let Some(value) = line.strip_prefix("parent ") {
                parent_hashes.push(value.to_owned());
            } else if let Some(value) = line.strip_prefix("author ") {
                author = Some(value.to_owned());
            } else if let Some(value) = line.strip_prefix("committer ") {
                committer = Some(value.to_owned());
            }
        }

        Ok(LooseCommitObject {
            object_path: display_path,
            is_available: true,
            object_type: Some(parsed.object_type),
            declared_size: Some(parsed.declared_size),
            tree_hash,
            parent_hashes,
            author,
            committer,
            message: Some(message.to_owned()),
            explanation: "This was read directly from .git/objects by decompressing the loose object and parsing the commit headers.".to_owned(),
        })
    }
}

fn normalize_object_hash(hash: &str) -> Result<&str, AppError> {
    let trimmed = hash.trim();

    if trimmed.len() != 40
        || !trimmed
            .chars()
            .all(|character| character.is_ascii_hexdigit())
    {
        return Err(AppError::invalid_path("Invalid commit hash."));
    }

    Ok(trimmed)
}

fn loose_object_path(git_dir: &Path, hash: &str) -> PathBuf {
    git_dir.join("objects").join(&hash[0..2]).join(&hash[2..])
}

fn read_loose_object(path: &Path) -> Result<ParsedLooseObject, AppError> {
    let metadata = fs::metadata(path)
        .map_err(|_| AppError::read_failure("Could not read loose Git object."))?;
    if metadata.len() > MAX_LOOSE_OBJECT_BYTES {
        return Err(AppError::read_failure(
            "Loose Git object is too large for the educational parser.",
        ));
    }

    let compressed =
        fs::read(path).map_err(|_| AppError::read_failure("Could not read loose Git object."))?;
    let mut decoder = ZlibDecoder::new(&compressed[..]);
    let mut decompressed = Vec::new();
    let mut limited_decoder = decoder
        .by_ref()
        .take(MAX_DECOMPRESSED_OBJECT_BYTES.saturating_add(1));
    limited_decoder
        .read_to_end(&mut decompressed)
        .map_err(|_| AppError::read_failure("Could not decompress loose Git object."))?;
    if decompressed.len() as u64 > MAX_DECOMPRESSED_OBJECT_BYTES {
        return Err(AppError::read_failure(
            "Loose Git object expands too large for the educational parser.",
        ));
    }

    let Some(nul_index) = decompressed.iter().position(|byte| *byte == 0) else {
        return Err(AppError::read_failure(
            "Loose Git object header is invalid.",
        ));
    };

    let header = String::from_utf8_lossy(&decompressed[..nul_index]);
    let Some((object_type, size_text)) = header.split_once(' ') else {
        return Err(AppError::read_failure(
            "Loose Git object header is invalid.",
        ));
    };
    let declared_size = size_text
        .parse::<usize>()
        .map_err(|_| AppError::read_failure("Loose Git object size is invalid."))?;
    let content = decompressed[nul_index + 1..].to_vec();

    if declared_size != content.len() {
        return Err(AppError::read_failure(
            "Loose Git object size does not match its header.",
        ));
    }

    Ok(ParsedLooseObject {
        object_type: object_type.to_owned(),
        declared_size,
        content,
    })
}

fn split_commit_content(content: &str) -> (&str, &str) {
    content.split_once("\n\n").unwrap_or((content, ""))
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::io::Write;
    use std::path::PathBuf;
    use std::time::{SystemTime, UNIX_EPOCH};

    use flate2::write::ZlibEncoder;
    use flate2::Compression;

    use super::LooseObjectParser;

    struct TestDir {
        path: PathBuf,
    }

    impl TestDir {
        fn new(name: &str) -> Self {
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system clock should be after Unix epoch")
                .as_nanos();
            let path = std::env::temp_dir().join(format!(
                "visual_git_app_loose_parser_{name}_{}_{}",
                std::process::id(),
                timestamp
            ));

            fs::create_dir_all(&path).expect("test directory should be created");

            Self { path }
        }
    }

    impl Drop for TestDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    #[test]
    fn parses_loose_commit_object() {
        let test_dir = TestDir::new("commit");
        let git_dir = test_dir.path.join(".git");
        let hash = "1234567890abcdef1234567890abcdef12345678";
        let object_dir = git_dir.join("objects").join(&hash[0..2]);
        fs::create_dir_all(&object_dir).expect("object directory should be created");

        let body = "tree abcdef1234567890abcdef1234567890abcdef12\nparent 1111111111111111111111111111111111111111\nauthor Ada <ada@example.invalid> 1700000000 +0000\ncommitter Ada <ada@example.invalid> 1700000001 +0000\n\nInitial commit\n";
        let loose_bytes = format!("commit {}\0{}", body.len(), body);
        let object_path = object_dir.join(&hash[2..]);
        write_zlib_object(&object_path, loose_bytes.as_bytes());

        let parsed = LooseObjectParser::new(git_dir)
            .parse_commit(hash)
            .expect("loose commit should parse");

        assert!(parsed.is_available);
        assert_eq!(parsed.object_type.as_deref(), Some("commit"));
        assert_eq!(
            parsed.tree_hash.as_deref(),
            Some("abcdef1234567890abcdef1234567890abcdef12")
        );
        assert_eq!(parsed.parent_hashes.len(), 1);
        assert_eq!(parsed.message.as_deref(), Some("Initial commit\n"));
    }

    #[test]
    fn reports_missing_loose_object_without_failing() {
        let test_dir = TestDir::new("missing");
        let git_dir = test_dir.path.join(".git");
        fs::create_dir_all(git_dir.join("objects")).expect("objects directory should be created");

        let parsed = LooseObjectParser::new(git_dir)
            .parse_commit("1234567890abcdef1234567890abcdef12345678")
            .expect("missing loose object should be reported");

        assert!(!parsed.is_available);
        assert!(parsed.explanation.contains("packfile"));
    }

    #[test]
    fn rejects_oversized_loose_object_before_decompressing() {
        let test_dir = TestDir::new("oversized");
        let git_dir = test_dir.path.join(".git");
        let hash = "1234567890abcdef1234567890abcdef12345678";
        let object_dir = git_dir.join("objects").join(&hash[0..2]);
        fs::create_dir_all(&object_dir).expect("object directory should be created");
        fs::write(
            object_dir.join(&hash[2..]),
            vec![0_u8; super::MAX_LOOSE_OBJECT_BYTES as usize + 1],
        )
        .expect("oversized object should be written");

        let error = LooseObjectParser::new(git_dir)
            .parse_commit(hash)
            .expect_err("oversized object should fail");

        assert_eq!(error.code, crate::errors::AppErrorCode::ReadFailure);
        assert!(error.message.contains("too large"));
    }

    fn write_zlib_object(path: &Path, bytes: &[u8]) {
        let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
        encoder.write_all(bytes).expect("object should be encoded");
        let compressed = encoder.finish().expect("object should finish encoding");
        fs::write(path, compressed).expect("object file should be written");
    }

    use std::path::Path;
}
