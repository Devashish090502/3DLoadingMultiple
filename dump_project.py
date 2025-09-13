import os

EXCLUDE_DIRS = {
    "node_modules", ".next", ".git", "__pycache__", ".vscode", ".idea", ".turbo", ".vercel", ".expo"
}

EXCLUDE_FILES = {
    ".DS_Store", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"
}

EXCLUDE_EXTENSIONS = {
    ".lock", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".mp4", ".mp3",
    ".webm", ".ttf", ".woff", ".woff2", ".eot", ".otf", ".zip", ".tar", ".gz",
    ".exe", ".dll", ".bin", ".log"
}

structure_file = open("project_structure.txt", "w", encoding="utf-8")
code_dump_file = open("code_dump.txt", "w", encoding="utf-8")

def is_binary_or_excluded(filename):
    return (
        filename in EXCLUDE_FILES or
        any(filename.lower().endswith(ext) for ext in EXCLUDE_EXTENSIONS)
    )

def dump_structure_and_code(path, indent=""):
    for item in sorted(os.listdir(path)):
        full_path = os.path.join(path, item)

        if item in EXCLUDE_FILES:
            continue
        if os.path.isdir(full_path):
            if item in EXCLUDE_DIRS:
                continue
            structure_file.write(f"{indent}{item}/\n")
            dump_structure_and_code(full_path, indent + "  ")
        else:
            if is_binary_or_excluded(item):
                continue
            structure_file.write(f"{indent}{item}\n")
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    code_dump_file.write(f"\n\n### {full_path} ###\n\n")
                    code_dump_file.write(f.read())
            except Exception as e:
                code_dump_file.write(f"\n\n### {full_path} ###\n\n")
                code_dump_file.write(f"[Error reading file: {e}]\n")

if __name__ == "__main__":
    root_dir = "."  # Set to your project path if not in root
    dump_structure_and_code(root_dir)
    structure_file.close()
    code_dump_file.close()
    print("✅ Done. Files saved: 'project_structure.txt' and 'code_dump.txt'")
