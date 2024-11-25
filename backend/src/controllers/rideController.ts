import { Request, Response } from 'express';
import axios from 'axios';
import { Op } from 'sequelize';
import { Driver } from '../models/Driver';
import { Ride } from '../models/Ride';
import { drivers } from '../data/drivers';

export const estimateRide = async (req: Request, res: Response): Promise<void> => {
  const { customer_id, origin, destination } = req.body;

  if (!customer_id || !origin || !destination || origin === destination) {
    res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'Customer ID, origin and destination are required and must be different.'
    });
    return;
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        key: process.env.GOOGLE_API_KEY
      }
    });

    const route = response.data.routes[0];
    const distance = route.legs[0].distance.value / 1000; // Convert to km
    const duration = route.legs[0].duration.text;
    const startLocation = route.legs[0].start_location;
    const endLocation = route.legs[0].end_location;

    const availableDrivers = drivers.filter(driver => distance >= driver.min_km)
      .map(driver => ({
        id: driver.id,
        name: driver.name,
        description: driver.description,
        vehicle: driver.vehicle,
        review: driver.review,
        value: driver.rate * distance
      }))
      .sort((a, b) => a.value - b.value);

    res.json({
      origin: {
        latitude: startLocation.lat,
        longitude: startLocation.lng
      },
      destination: {
        latitude: endLocation.lat,
        longitude: endLocation.lng
      },
      distance,
      duration,
      options: availableDrivers,
      routeResponse: response.data
    });
  } catch (error) {
    res.status(500).json({
      error_code: 'ROUTE_ERROR',
      error_description: 'Erro ao calcular rota. Por favor, tente novamente.'
    });
  }
};

export const confirmRide = async (req: Request, res: Response): Promise<void> => {
  const { customer_id, origin, destination, distance, duration, driver, value } = req.body;

  if (!customer_id || !origin || !destination || origin === destination) {
    res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'O ID do cliente, a origem e o destino são obrigatórios e devem ser diferentes.'
    });
    return;
  }

  const selectedDriver = drivers.find(d => d.id === driver.id && d.name === driver.name);
  if (!selectedDriver) {
    res.status(404).json({
      error_code: 'DRIVER_NOT_FOUND',
      error_description: 'O driver especificado não foi encontrado.'
    });
    return;
  }

  if (distance < selectedDriver.min_km) {
    res.status(406).json({
      error_code: 'INVALID_DISTANCE',
      error_description: `A distância é muito curta para o driver selecionado. Distância mínima: ${selectedDriver.min_km} km.`
    });
    return;
  }

  try {
    await Ride.create({
      customer_id,
      origin,
      destination,
      distance,
      duration,
      driver_id: driver.id,
      driver_name: driver.name,
      value
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      error_code: 'DB_ERROR',
      error_description: 'Ocorreu um erro ao salvar a viagem. Tente novamente.'
    });
  }
};

export const getRideHistory = async (req: Request, res: Response): Promise<void> => {
  const { customer_id } = req.params;
  const { driver_id } = req.query;

  if (!customer_id) {
    res.status(400).json({
      error_code: 'INVALID_DATA',
      error_description: 'É necessário o ID do cliente.'
    });
    return;
  }

  let whereClause: any = { customer_id };

  if (driver_id) {
    const driver = drivers.find(d => d.id === Number(driver_id));
    if (!driver) {
      res.status(400).json({
        error_code: 'INVALID_DRIVER',
        error_description: 'O ID do driver especificado é inválido.'
      });
      return;
    }
    whereClause.driver_id = driver.id;
  }

  try {
    const rides = await Ride.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    if (rides.length === 0) {
      res.status(404).json({
        error_code: 'NO_RIDES_FOUND',
        error_description: 'Nenhuma viagem encontrada para os critérios especificados.'
      });
      return;
    }

    res.status(200).json({
      customer_id,
      rides: rides.map(ride => ({
        id: ride.id,
        date: ride.createdAt,
        origin: ride.origin,
        destination: ride.destination,
        distance: ride.distance,
        duration: ride.duration,
        driver: {
          id: ride.driver_id,
          name: ride.driver_name
        },
        value: ride.value
      }))
    });
  } catch (error) {
    res.status(500).json({
      error_code: 'DB_ERROR',
      error_description: 'Ocorreu um erro ao buscar o histórico de viagem. Tente novamente.'
    });
  }
};
