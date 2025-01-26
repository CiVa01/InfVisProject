// idToName.js

// Mapping van gemeente-ID's naar namen
const idToNameMapping = {
	GM0171: 'Utrecht',
	GM0035: 'Rotterdam',
	GM0200: 'Amsterdam',
	// Voeg hier meer ID's en namen toe
};

// Functie om een ID om te zetten naar de naam
function getNameFromId(id) {
	return idToNameMapping[id] || id; // Als de ID niet bestaat in de mapping, geef de ID zelf terug
}
