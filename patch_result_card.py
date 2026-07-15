import re

with open('src/components/ui/ResultCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'return (\n    <motion.div\n      key={String(value)}',
    'return (\n    <motion.div'
)

with open('src/components/ui/ResultCard.tsx', 'w') as f:
    f.write(content)
