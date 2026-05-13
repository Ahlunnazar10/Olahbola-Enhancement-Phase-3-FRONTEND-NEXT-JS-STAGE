import re

# Read the file
with open('E:\\DEVELOPER\\NEXT\\olahbola\\app\(main)\\.\.\.\.\.\.\\artikel\\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old pattern - look for the specific div structure
old_pattern = r'(\s+<div className="p-6 flex-1 flex flex-col justify-between">.*?</div>\s+)</Link>'

# Define the new content
new_content = '''                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold uppercase">
                                                            {article.category?.name}
                                                        </span>
                                                        <span className="text-on-surface-variant text-xs font-bold">
                                                            {article.created_diff}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-lg uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                                                        {article.title}
                                                    </h3>
                                                </div>
                                                <div className="flex justify-between items-center mt-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-xs text-outline">
                                                                visibility
                                                            </span>
                                                            <span className="text-on-surface-variant text-xs font-bold">
                                                                {article.views || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-xs text-outline">
                                                                person
                                                            </span>
                                                            <span className="text-on-surface-variant text-xs font-bold">
                                                                {article.author?.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-primary text-sm">
                                                        article
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>'''

# Replace the content - find the pattern that ends with </Link>
# We need to be more specific - look for the article card pattern
pattern_start = r'(\s+<Link\s+[^>]+>\s+<div className="h-48[^>]+>.*?<div className="p-6 flex-1 flex flex-col justify-between">).*?(</div>\s+</Link>)'

def replacer(match):
    before = match.group(1)  # Everything before the p-6 div
    after = match.group(2)   # The closing tags
    return before + new_content

updated_content = re.sub(pattern_start, replacer, content, flags=re.DOTALL, count=1)

# Write back to file
with open('E:\\DEVELOPER\\NEXT\\olahbola\\app\(main)\\.\.\.\.\.\.\\artikel\\page.tsx', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print('File updated successfully')