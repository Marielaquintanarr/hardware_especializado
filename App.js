import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  const findUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permiso de ubicación denegado');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const toggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  const fetchNearbyRestaurants = async () => {
    if (!location) {
      setErrorMsg('Por favor, encuentra tu ubicación primero.');
      return;
    }

    const apiKey = 'AIzaSyBC7vxUZRlZFInW4vPVui5uErj3cAK2x4c';
    const radius = 1500; // Radio en metros
    const type = 'restaurant';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results) {
        setRestaurants(data.results);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {mapRegion ? (
        <MapView
          style={styles.map}
          region={mapRegion}
          showsUserLocation={true}
          showsTraffic={showTraffic}
        >
          {restaurants.map((restaurant, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: restaurant.geometry.location.lat,
                longitude: restaurant.geometry.location.lng,
              }}
              title={restaurant.name}
              description={restaurant.vicinity}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Encontrar mi ubicación" onPress={findUserLocation} />
        <Button title={showTraffic ? 'Ocultar tráfico' : 'Mostrar tráfico'} onPress={toggleTraffic} />
        <Button title="Mostrar restaurantes cercanos" onPress={fetchNearbyRestaurants} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height - 150,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
