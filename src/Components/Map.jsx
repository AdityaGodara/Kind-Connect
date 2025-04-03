import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const Map = ({ latitude, longitude }) => {
  const mapStyles = {
    height: "500px",
    width: "100%",
  };

  const defaultCenter = {
    lat: latitude,
    lng: longitude,
  };

  const MapsApi = import.meta.env.VITE_GOOGLE_MAPS_API;

  return (
    <LoadScript googleMapsApiKey={MapsApi}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        center={defaultCenter}
        zoom={15}
      >
        <Marker position={defaultCenter} />
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
