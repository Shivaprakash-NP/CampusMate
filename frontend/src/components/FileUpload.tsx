import axios from "axios";
import React, { useState } from "react";

export default function FileUpload() {

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const form = new FormData();
    form.append("file", selectedFile);   // ✅ use selectedFile

    try {
      await axios.post("http://localhost:8080/api/upload", form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      console.log("file uploaded");
      console.log(selectedFile.name);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h2>Upload files here</h2>

      <input
        type="file"
        onChange={handleFileChange}
      />

      {file && (
        <p>Selected file: {file.name}</p>
      )}
    </>
  );
}
