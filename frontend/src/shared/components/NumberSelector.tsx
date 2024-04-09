import { Button, Chip, Grid, Typography } from "@mui/material";

interface NumberSelectorProps {
  selectedNumbers: number[];
  onNumberChange: (number: number) => void;
}

function NumberSelector({
  selectedNumbers,
  onNumberChange,
}: NumberSelectorProps) {
  const handleButtonClick = (number: number) => {
    onNumberChange(number);
  };

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          marginTop: "8px",
          color: "secondary.main",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: "1.1rem",
        }}>
        Select up to 5 lucky numbers{" "}
        <Chip
          label="Optional"
          variant="outlined"
          sx={{
            backgroundColor: "transparent",
            color: "secondary.main",
            borderColor: "secondary.main",
          }}
          size="small"
        />
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: "grey.600",
          textAlign: "center",
          fontSize: "0.9rem",
        }}>
        ...for a chance to win an extra £100. One lucky number will be drawn.{" "}
        <br />
        If multiple winners, the cash prize will be shared:
      </Typography>
      <Grid
        container
        spacing={1}
        sx={{
          margin: "8px",
          marginTop: "0px",
          width: "100%",
        }}>
        {Array.from({ length: 40 }, (_, i) => i + 1).map((number) => (
          <Grid item key={number}>
            <Button
              variant={
                selectedNumbers.includes(number) ? "contained" : "outlined"
              }
              color="primary"
              onClick={() => handleButtonClick(number)}
              disabled={
                !selectedNumbers.includes(number) && selectedNumbers.length >= 5
              }>
              {number}
            </Button>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default NumberSelector;
