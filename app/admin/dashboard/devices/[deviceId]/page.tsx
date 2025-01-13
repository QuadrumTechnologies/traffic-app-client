interface DeviceDetailsProps {
  params: any;
}
const DeviceDetails: React.FC<DeviceDetailsProps> = ({ params }) => {
  console.log("Device ID", params);
  return <div>deviceActiveProgDataceActiveProgData</div>;
};

export default DeviceDetails;
