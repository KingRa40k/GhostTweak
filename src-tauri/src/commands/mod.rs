pub mod backup;
pub mod cleaner;
pub mod performance;
pub mod system_info;
pub mod tweaks;
pub mod security;
pub mod trial;
pub mod window_controls;

#[allow(dead_code)]
pub fn hidden_command(program: &str) -> std::process::Command {
    let mut cmd = std::process::Command::new(program);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000);
    }
    cmd
}
