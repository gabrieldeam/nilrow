package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.location.Coordinate;
import marketplace.nilrow.domain.catalog.location.Location;
import marketplace.nilrow.domain.catalog.location.LocationDTO;
import marketplace.nilrow.domain.catalog.location.Polygon;
import marketplace.nilrow.repositories.CatalogRepository;
import marketplace.nilrow.repositories.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    public LocationDTO createLocation(LocationDTO locationDTO, String catalogId) {
        Optional<Catalog> catalogOpt = catalogRepository.findById(catalogId);
        if (catalogOpt.isEmpty()) {
            throw new RuntimeException("Catálogo não encontrado");
        }

        Catalog catalog = catalogOpt.get();
        Location location = convertToEntity(locationDTO);
        location.setCatalog(catalog);

        Location savedLocation = locationRepository.save(location);
        return convertToDTO(savedLocation);
    }

    public void deleteLocation(String locationId) {
        locationRepository.deleteById(locationId);
    }

    public List<LocationDTO> getLocationsByCatalogId(String catalogId) {
        return locationRepository.findByCatalogId(catalogId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private Location convertToEntity(LocationDTO locationDTO) {
        Location location = new Location();
        location.setName(locationDTO.getName());
        location.setPosition(locationDTO.getPosition());
        location.setAction(locationDTO.getAction());

        // Convert includedPolygons
        location.setIncludedPolygons(locationDTO.getIncludedPolygons().stream()
                .map(polygonCoords -> {
                    Polygon polygon = new Polygon();
                    polygon.setCoordinates(polygonCoords.stream()
                            .map(coord -> new Coordinate(null, coord.get(0), coord.get(1)))
                            .collect(Collectors.toList()));
                    return polygon;
                }).collect(Collectors.toList()));

        // Convert excludedPolygons
        location.setExcludedPolygons(locationDTO.getExcludedPolygons().stream()
                .map(polygonCoords -> {
                    Polygon polygon = new Polygon();
                    polygon.setCoordinates(polygonCoords.stream()
                            .map(coord -> new Coordinate(null, coord.get(0), coord.get(1)))
                            .collect(Collectors.toList()));
                    return polygon;
                }).collect(Collectors.toList()));

        return location;
    }

    private LocationDTO convertToDTO(Location location) {
        LocationDTO locationDTO = new LocationDTO();
        locationDTO.setId(location.getId());
        locationDTO.setName(location.getName());
        locationDTO.setPosition(location.getPosition());
        locationDTO.setAction(location.getAction());

        // Convert includedPolygons
        locationDTO.setIncludedPolygons(location.getIncludedPolygons().stream()
                .map(polygon -> polygon.getCoordinates().stream()
                        .map(coord -> List.of(coord.getLatitude(), coord.getLongitude()))
                        .collect(Collectors.toList()))
                .collect(Collectors.toList()));

        // Convert excludedPolygons
        locationDTO.setExcludedPolygons(location.getExcludedPolygons().stream()
                .map(polygon -> polygon.getCoordinates().stream()
                        .map(coord -> List.of(coord.getLatitude(), coord.getLongitude()))
                        .collect(Collectors.toList()))
                .collect(Collectors.toList()));

        return locationDTO;
    }
}
