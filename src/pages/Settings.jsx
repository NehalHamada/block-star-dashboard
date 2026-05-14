import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/common/Card";

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">الإعدادات</h1>
      <Card>
        <CardHeader>
          <CardTitle>الإعدادات العامة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">إعدادات النظام قريباً...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
