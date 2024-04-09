import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        color: "white",
        backgroundColor: "primary.main",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 0",
      }}>
      <Container>
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}>
          <Grid
            item
            xs={12}
            sm={4}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}>
            <Typography variant="body1">Robert Gordon University</Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}>
            <Typography variant="body1">
              Built with 💛 by Francesco Gruosso
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}>
            <Typography variant="body1" color="inherit">
              CM4025 Enterprise Web Systems
            </Typography>{" "}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
