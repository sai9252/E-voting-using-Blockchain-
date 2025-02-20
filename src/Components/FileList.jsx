// FileList.js
import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

const FileList = ({ files, onDownload }) => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {files.map((file, index) => (
                    <TableRow key={index}>
                        <TableCell>{file.name}</TableCell>
                        <TableCell>{Math.round(file.size / 1024)} KB</TableCell>
                        <TableCell>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => onDownload(file)}
                            >
                                Download
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default FileList;