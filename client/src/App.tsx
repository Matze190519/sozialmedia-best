import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import ContentQueue from "./pages/ContentQueue";
import ApprovalPage from "./pages/ApprovalPage";
import CalendarPage from "./pages/CalendarPage";
import GeneratorPage from "./pages/GeneratorPage";
import CreatorSpyPage from "./pages/CreatorSpyPage";
import TemplatesPage from "./pages/TemplatesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TeamPage from "./pages/TeamPage";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/queue" component={ContentQueue} />
        <Route path="/approval" component={ApprovalPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/generator" component={GeneratorPage} />
        <Route path="/creator-spy" component={CreatorSpyPage} />
        <Route path="/templates" component={TemplatesPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/team" component={TeamPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
