const fs = require('fs');

let content = fs.readFileSync('src/components/pages/Contact.tsx', 'utf8');

content = content.replace(
  /<Button[\s\S]*?className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r hover:from-blue-700 disabled:opacity-75 text-white bg-blue-600 font-bold rounded-2xl shadow-\[0_4px_24px_rgba\(37,99,235,0\.25\)\] transition-all overflow-hidden"[\s\S]*?>[\s\S]*?(?:{status === 'loading' \? \([\s\S]*?Sending via Gmail\.\.\.[\s\S]*?\) : \(workspaceToken \? 'Send Message via Gmail' : 'Sign in with Google to Send'\)}\s*)<\/Button>/m,
  `<Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={status === 'loading'}
              loadingText="Sending via Gmail..."
              className="mt-4"
            >
              {workspaceToken ? 'Send Message via Gmail' : 'Sign in with Google to Send'}
            </Button>`
);

fs.writeFileSync('src/components/pages/Contact.tsx', content);

