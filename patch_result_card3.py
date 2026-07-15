import re

with open('src/components/ui/ResultCard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''  useEffect(() => {
    if (hasMounted) {
      controls.start({
        opacity: [0, 1],
        y: [15, 0],
        scale: [0.98, 1],
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
      });
    } else {
      setHasMounted(true);
    }
  }, [value, controls]);''',
'''  useEffect(() => {
    if (!hasMounted) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }
      });
      setHasMounted(true);
    } else {
      controls.set({ opacity: 0, y: 15, scale: 0.98 });
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
      });
    }
  }, [value, controls, delay]);'''
)

content = content.replace(
'''    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}''',
'''    <motion.div
      animate={controls}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}'''
)

with open('src/components/ui/ResultCard.tsx', 'w') as f:
    f.write(content)
