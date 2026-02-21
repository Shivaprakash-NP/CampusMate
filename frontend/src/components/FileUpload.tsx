import axios from "axios";
import React, { useState } from "react";

export default function FileUpload() {

  const [file, setFile] = useState<File | null>(null);  
  const [output,setOutput] = useState<any>(null)


const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const form = new FormData();
    form.append("file", selectedFile);   

    try {
      const response = await axios.post("http://localhost:8080/api/upload", form, {
        withCredentials: true, 
        responseType: 'text' 
      });
      setOutput(response.data);
    } catch (err) {
      console.error("Upload Error:", err);
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
      <div id="output">
            <p id="gptoutput">{output}</p>
      </div>
    </>
  );
}
