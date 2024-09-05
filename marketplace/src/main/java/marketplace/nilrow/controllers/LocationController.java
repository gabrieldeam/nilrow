package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.location.LocationDTO;
import marketplace.nilrow.infra.exception.ExceptionDTO;
import marketplace.nilrow.services.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
@Tag(name = "Catalog", description = "Operações relacionadas ao canal")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @PostMapping("/create/{catalogId}")
    public ResponseEntity<?> createLocation(@RequestBody LocationDTO locationDTO, @PathVariable String catalogId) {
        try {
            LocationDTO savedLocation = locationService.createLocation(locationDTO, catalogId);
            return ResponseEntity.ok(savedLocation);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ExceptionDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    @DeleteMapping("/delete/{locationId}")
    public ResponseEntity<Void> deleteLocation(@PathVariable String locationId) {
        locationService.deleteLocation(locationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/catalog/{catalogId}")
    public ResponseEntity<List<LocationDTO>> getLocationsByCatalogId(@PathVariable String catalogId) {
        List<LocationDTO> locations = locationService.getLocationsByCatalogId(catalogId);
        return ResponseEntity.ok(locations);
    }
}
