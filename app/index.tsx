import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { API_KEY } from "@/utils/WeatherAPIKey";
import Weather from "@/components/Weather";

import * as Location from "expo-location";
import { WeatherConditionsType } from "@/utils/WeatherConditions";

const App = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<number>(0);
  const [weatherCondition, setWeatherCondition] =
    useState<WeatherConditionsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
    "Location Loading....."
  );
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
  useEffect(() => {
    checkIfLocationEnabled();
    getCurrentLocation();
  }, []);
  //check if location is enable or not
  const checkIfLocationEnabled = async () => {
    let enabled = await Location.hasServicesEnabledAsync(); //returns true or false
    if (!enabled) {
      //if not enable
      Alert.alert("Location not enabled", "Please enable your Location", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    } else {
      setLocationServicesEnabled(enabled); //store true into state
    }
  };
  //get current location
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync(); //used for the pop up box where we give permission to use location
    console.log("Location:::", status);
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Allow the app to use the location services",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]
      );
    }

    //get current position lat and long
    const { coords } = await Location.getCurrentPositionAsync();

    if (coords) {
      const { latitude, longitude } = coords;
      fetchWeather(latitude, longitude);

      //provide lat and long to get the the actual address
      let response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      //loop on the response to get the actual result
      for (let item of response) {
        let address = `${item.name} ${item.city} ${item.postalCode}`;
        setDisplayCurrentAddress(address);
      }
    }
  };

  const fetchWeather = (lat: number, lon: number) => {
    fetch(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_KEY}&units=metric`
    )
      .then((res) => res.json())
      .then((json) => {
        setTemperature(json.main.temp);
        setWeatherCondition(json.weather[0].main);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setError("Error Getting Weather Conditions");
      });
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Fetching The Weather</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>An Error Occurred</Text>
        </View>
      ) : (
        <Weather weather={weatherCondition} temperature={temperature} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDE4",
  },
  loadingText: {
    fontSize: 30,
  },
});

export default App;
