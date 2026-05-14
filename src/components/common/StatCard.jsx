import Card from "./Card";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ name, icon: Icon, value, color }) => {
  return (
    <Card className="border-l-4" style={{ borderLeftColor: color }}>
      <div className="px-4 py-5 sm:p-6">
        <span className="flex items-center text-sm font-medium text-dark-gray">
          <Icon size={20} className="mr-2" style={{ color }} />
          {name}
        </span>
        <p className="mt-1 text-3xl font-semibold text-text-black">{value}</p>
      </div>
    </Card>
  );
};

export default StatCard;
