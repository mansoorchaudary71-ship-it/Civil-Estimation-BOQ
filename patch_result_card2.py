import re

with open('src/components/ui/ResultCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      whileInView={!hasMounted ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}''',
'''  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}'''
)

with open('src/components/ui/ResultCard.tsx', 'w') as f:
    f.write(content)
