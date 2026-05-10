import os
import re

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

    # Fix smart quotes
    content = content.replace("\u201c", '"')
    content = content.replace("\u201d", '"')
    content = content.replace("\u2018", "'")
    content = content.replace("\u2019", "'")

    # Fix ellipsis character → spread operator
    content = content.replace("\u2026", "...")

    # Fix en/em dash
    content = content.replace("\u2013", "-")
    content = content.replace("\u2014", "--")

    # Remove markdown code fences (``` lines)
    lines = content.split("\n")
    lines = [l for l in lines if not l.strip().startswith("```")]
    content = "\n".join(lines)

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Fixed: " + path)
        fixed += 1
    else:
        print("Clean: " + path)

print("\n" + str(fixed) + " files fixed.")
