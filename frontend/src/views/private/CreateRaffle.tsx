import React, { useState } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";

import { createRaffle } from "@/services/rafflesService";

interface RaffleFormData {
  title: string;
  description: string;
  prizeDetails: string;
  drawDate: string;
  imageUrl?: string;
}

type CreateRaffleProps = {
  onClose: () => void;
};

const CreateRaffle = ({ onClose }: CreateRaffleProps) => {
  const defaultDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const formattedDefaultDate = defaultDate.toISOString().slice(0, 16); // format to 'YYYY-MM-DDThh:mm'

  const [formData, setFormData] = useState<RaffleFormData>({
    title: "",
    description: "",
    prizeDetails: "",
    drawDate: formattedDefaultDate,
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [submitStatus, setSubmitStatus] = useState("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setImagePreview(value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      imageUrl: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
    setSubmitStatus("submitting");
    try {
      const submissionData = {
        title: formData.title,
        description: formData.description,
        prizeDetails: formData.prizeDetails,
        drawDate: new Date(formData.drawDate),
        imageUrl: formData.imageUrl,
      };

      await createRaffle(submissionData);
      console.log("Raffle created successfully");
      setSubmitStatus("submitted");
      setSnackbarOpen(true);

      let count = 5;
      const intervalId = setInterval(() => {
        if (count <= 1) {
          clearInterval(intervalId);
          onClose();
        } else {
          count -= 1;
          setCountdown(count);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to create raffle", error);
      setSubmitStatus("idle");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create a New Raffle
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Raffle Title"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            id="imageUrl"
            name="imageUrl"
            label="Image URL"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.imageUrl || ""}
            onChange={handleImageUrlChange}
          />
          {imagePreview && (
            <Box mt={2} textAlign="center">
              <img
                src={imagePreview}
                alt="Raffle Preview"
                style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 10 }}
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            id="prizeDetails"
            name="prizeDetails"
            label="Prize Details"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.prizeDetails}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="dense"
            id="drawDate"
            name="drawDate"
            label="Draw Date"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.drawDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={
              submitStatus === "submitting" || submitStatus === "submitted"
            }>
            {submitStatus === "submitting"
              ? "Submitting..."
              : submitStatus === "submitted"
                ? "Submitted!"
                : "Create"}
          </Button>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}>
          Raffle created successfully! Closing in {countdown}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateRaffle;
