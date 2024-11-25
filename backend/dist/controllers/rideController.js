"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRideHistory = exports.confirmRide = exports.estimateRide = void 0;
const axios_1 = __importDefault(require("axios"));
const estimateRide = async (req, res) => {
    const { customer_id, origin, destination } = req.body;
    if (!customer_id || !origin || !destination || origin === destination) {
        res.status(400).json({
            error_code: 'INVALID_DATA',
            error_description: 'Customer ID, origin and destination are required and must be different.'
        });
        return;
    }
    try {
        const response = await axios_1.default.get('https://maps.googleapis.com/maps/api/directions/json', {
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
        const drivers = [
            {
                id: 1,
                name: 'Homer Simpson',
                description: 'Olá! Sou o Homer, seu motorista camarada! Relaxe e aproveite o passeio, com direito a rosquinhas e boas risadas (e talvez alguns desvios).',
                vehicle: 'Plymouth Valiant 1973 rosa e enferrujado',
                review: {
                    rating: 2,
                    comment: 'Motorista simpático, mas errou o caminho 3 vezes. O carro cheira a donuts.'
                },
                rate: 2.5,
                min_km: 1
            },
            {
                id: 2,
                name: 'Dominic Toretto',
                description: 'Ei, aqui é o Dom. Pode entrar, vou te levar com segurança e rapidez ao seu destino. Só não mexa no rádio, a playlist é sagrada.',
                vehicle: 'Dodge Charger R/T 1970 modificado',
                review: {
                    rating: 4,
                    comment: 'Que viagem incrível! O carro é um show à parte e o motorista, apesar de ter uma cara de poucos amigos, foi super gente boa. Recomendo!'
                },
                rate: 5.0,
                min_km: 5
            },
            {
                id: 3,
                name: 'James Bond',
                description: 'Boa noite, sou James Bond. À seu dispor para um passeio suave e discreto. Aperte o cinto e aproveite a viagem.',
                vehicle: 'Aston Martin DB5 clássico',
                review: {
                    rating: 5,
                    comment: 'Serviço impecável! O motorista é a própria definição de classe e o carro é simplesmente magnífico. Uma experiência digna de um agente secreto.'
                },
                rate: 10.0,
                min_km: 10
            }
        ];
        const availableDrivers = drivers.filter(driver => distance >= driver.min_km)
            .map(driver => ({
            ...driver,
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
    }
    catch (error) {
        res.status(500).json({
            error_code: 'ROUTE_ERROR',
            error_description: 'Error calculating route. Please try again.'
        });
    }
};
exports.estimateRide = estimateRide;
const confirmRide = async (req, res) => {
    // Lógica para confirmar a viagem e salvar no banco de dados
    res.status(200).json({ success: true });
};
exports.confirmRide = confirmRide;
const getRideHistory = async (req, res) => {
    // Lógica para obter o histórico de viagens do cliente
    res.status(200).json({ rides: [] });
};
exports.getRideHistory = getRideHistory;
