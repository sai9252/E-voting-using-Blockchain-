// client/src/App.js
import React, { useState, useEffect } from 'react';
import FileList from './FileList';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';


const useStyles = makeStyles({
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
    },
});

export default function App() {
    const classes = useStyles();
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/files');
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    return (
        <div className={classes.container}>
            <h1>File Manager</h1>
            {files.length === 0 ? (
                <p>No files found in the uploads folder.</p>
            ) : (
                <FileList files={files} onDownload={async(file) => {
                    // Handle download
                    const response = await fetch(file.downloadUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
                }} />
            )}
        </div>
    );
}