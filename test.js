const fs = require("fs");
const path = require("path");

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: (usage.rss / 1024 / 1024).toFixed(2) + " MB",
    heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2) + " MB",
    heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2) + " MB",
  };
}

function measureHeapUsage(directory) {
    console.log(directory)
  const files = fs.readdirSync(directory).filter(file => file.endsWith(".js"));

  console.log("Initial Memory Usage:", getMemoryUsage());

  files.forEach(file => {
    const filePath = path.join(directory, file);
    
    const beforeMemory = process.memoryUsage().heapUsed;
    require(filePath); // Load the file dynamically
    const afterMemory = process.memoryUsage().heapUsed;

    console.log(`File: ${file}`);
    console.log(`Heap Increase: ${((afterMemory - beforeMemory) / 1024 / 1024).toFixed(2)} MB`);
    console.log("Current Memory Usage:", getMemoryUsage());
    console.log("-------------------------------");
  });
}

// Change to your project directory
measureHeapUsage("D:/node/smartvoice_backend/routes");
