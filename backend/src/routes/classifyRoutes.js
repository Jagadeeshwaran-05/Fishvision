const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { spawn } = require("child_process");

const router = express.Router();

// upload dir
const uploadsDir = path.join(__dirname, "../../data/uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// POST /api/classify - accepts multipart form with field 'image'
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });

    const imagePath = req.file.path; // absolute path on disk
    const outputFilename = `annotated-${req.file.filename}`;
    const outputPath = path.join(uploadsDir, outputFilename);

    // call python script using conda environment
    const scriptPath = path.join(
      __dirname,
      "..",
      "..",
      "ml",
      "classify_fish.py"
    );

    // Use conda run to execute in tensorflow_legacy environment
    const conda = process.env.CONDA_EXE || "conda";
    const args = [
      "run",
      "-n",
      "tensorflow_legacy",
      "--no-capture-output",
      "python",
      scriptPath,
      imagePath,
      outputPath,
      (req.body.padding || 20).toString(),
    ];

    const py = spawn(conda, args, { cwd: path.join(__dirname, "..", "..") });
    let stdout = "";
    let stderr = "";
    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) {
        console.error("Python error:", stderr);
        return res.status(500).json({
          success: false,
          message: "Classification failed",
          error: stderr,
        });
      }

      try {
        const result = JSON.parse(stdout);
        // convert output_image to URL path
        if (result.output_image) {
          const rel = path
            .relative(
              path.join(__dirname, "..", "..", "data"),
              result.output_image
            )
            .replace(/\\/g, "/");
          result.output_image_url = `${req.protocol}://${req.get(
            "host"
          )}/${rel}`;
        }
        return res.json(result);
      } catch (err) {
        console.error("Parse JSON error", err, stdout);
        return res.status(500).json({
          success: false,
          message: "Failed to parse classifier output",
          raw: stdout,
          error: err.message,
        });
      }
    });
  } catch (error) {
    console.error("Classify route error", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
