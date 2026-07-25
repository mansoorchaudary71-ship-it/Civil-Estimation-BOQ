const fs = require('fs');

let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

const target = `{/* Tools */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Calculators</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Concrete Volume</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Steel Reinforcement</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Earthwork Cut/Fill</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Masonry Blocks</a></li>
              <li><a href="#" className="text-[#ff5722] hover:text-[#f4511e] transition-colors">View all tools &rarr;</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Services</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Quantity Takeoff</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">BOQ Generation</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cost Analysis</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Structural Design</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Engineering Standards</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>`;

const replacement = `{/* Services */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Services</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Quantity Takeoff</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">BOQ Generation</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Cost Analysis</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Structural Design</a></li>
            </ul>
          </div>

          {/* Industries */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Industries</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Residential</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Commercial</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Infrastructure</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Industrial</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-[14px] text-gray-500 dark:text-gray-400 font-medium">
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="global-animated-underline hover:text-gray-900 dark:hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/Footer.tsx', content);
  console.log("Successfully replaced content.");
} else {
  console.log("Target content not found. Here is the file snippet around that area:");
  const idx = content.indexOf('{/* Tools */}');
  if (idx !== -1) {
    console.log(content.substring(idx - 100, idx + 1000));
  } else {
    console.log("Couldn't find {/* Tools */} either.");
  }
}
