import os
import glob

# Fix smart quotes in all affected files
targets = [
    "app/api/contacts/route.ts",
    "app/api/alerts/route.ts",
    "app/api/batchdata/route.ts",
    "app/api/deals/route.ts",
    "app/api/pure/health/route.ts",
    "app/contacts/page.tsx",
    "app/contacts/[id]/page.tsx",
    "app/alerts/page.tsx",
    "app/deals/page.tsx",
]

fixed = 0
for path in targets:
    if not os.path.exists(path):
        print("MISSING: " + path)
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    original = content
    # Replace smart quotes with straight quotes
    content = content.replace("\u201c", '"')  # left double quote
    content = content.replace("\u201d", '"')  # right double quote
    content = content.replace("\u2018", "'")  # left single quote
    content = content.replace("\u2019", "'")  # right single quote
    content = content.replace("\u2013", "-")  # en dash
    content = content.replace("\u2014", "--") # em dash
    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Fixed: " + path)
        fixed += 1
    else:
        print("Clean: " + path)

print("\n" + str(fixed) + " files fixed.")
