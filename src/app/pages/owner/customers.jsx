import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { customerService } from "../../services/customer.service";

// TODO: Replace with actual auth context ownerId
const OWNER_ID = "owner-123";

export function CustomersList() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Replace with actual method when implemented
        const result = await customerService.getAll(OWNER_ID);
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl tracking-tight">Customers List</h1>
        <p className="text-muted-foreground mt-2">Manage your customers list</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No data found.</p>
            </div>
          ) : (
            <div className="text-sm">
              {/* Replace with actual data rendering */}
              <pre className="p-4 bg-muted/50 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
