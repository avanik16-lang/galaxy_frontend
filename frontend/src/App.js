import "@/App.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import GalaxyCareApp from "@/components/GalaxyCareApp";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <GalaxyCareApp />
      <Toaster position="top-center" richColors closeButton />
    </ThemeProvider>
  );
}

export default App;
