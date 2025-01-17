interface DeviceDetailsProps {
  params: any;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ params }) => {
  console.log("Device ID", params);
  return <div>Edit device here and View device</div>;
};

export default DeviceDetails;
