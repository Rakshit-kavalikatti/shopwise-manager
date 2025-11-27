import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Coming Soon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Detailed reports and analytics will be available here soon. This will include:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Daily, weekly, monthly, and yearly reports</li>
              <li>• Profit trend graphs</li>
              <li>• Product performance analysis</li>
              <li>• Export to PDF, Excel, and CSV</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
