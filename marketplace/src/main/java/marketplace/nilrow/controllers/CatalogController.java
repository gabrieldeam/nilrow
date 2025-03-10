package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.catalog.*;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.infra.exception.ExceptionDTO;
import marketplace.nilrow.services.CatalogService;
import marketplace.nilrow.services.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/catalog")
@Tag(name = "Catalog", description = "Operações relacionadas ao canal")
public class CatalogController {

    @Autowired
    private CatalogService catalogService;

    @Autowired
    private ChannelService channelService;

    @PostMapping("/create")
    public ResponseEntity<CatalogDTO> createCatalog(@RequestBody CatalogDTO catalogDTO) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        Optional<Channel> channelOpt = channelService.getChannelByPeopleUsername(username);
        if (channelOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String channelId = channelOpt.get().getId();
        Catalog savedCatalog = catalogService.createCatalog(catalogDTO, channelId);

        // Convert OperatingHours to OperatingHoursDTO
        List<OperatingHoursDTO> operatingHoursDTOList = savedCatalog.getOperatingHours().stream()
                .map(oh -> new OperatingHoursDTO(
                        oh.getDayOfWeek(),
                        oh.is24Hours(),
                        oh.isClosed(),
                        oh.getTimeIntervals().stream()
                                .map(ti -> new TimeIntervalDTO(ti.getOpenTime(), ti.getCloseTime()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        CatalogDTO responseDTO = new CatalogDTO(
                savedCatalog.getId(),
                savedCatalog.getName(),
                savedCatalog.getNameBoss(),
                savedCatalog.getCnpj(),
                savedCatalog.getEmail(),
                savedCatalog.getPhone(),
                savedCatalog.getAddress().getId(),
                catalogDTO.getOperatingHoursType(),
                operatingHoursDTOList
        );

        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/visible")
    public ResponseEntity<List<CatalogDTO>> getVisibleCatalogs() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        Optional<Channel> channelOpt = channelService.getChannelByPeopleUsername(username);
        if (channelOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<Catalog> visibleCatalogs = catalogService.getCatalogsByVisibility(channelOpt.get().getId(), true);
        List<CatalogDTO> catalogDTOs = visibleCatalogs.stream().map(this::convertToDTO).collect(Collectors.toList());

        return ResponseEntity.ok(catalogDTOs);
    }

    @GetMapping("/hidden")
    public ResponseEntity<List<CatalogDTO>> getHiddenCatalogs() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        Optional<Channel> channelOpt = channelService.getChannelByPeopleUsername(username);
        if (channelOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<Catalog> hiddenCatalogs = catalogService.getCatalogsByVisibility(channelOpt.get().getId(), false);
        List<CatalogDTO> catalogDTOs = hiddenCatalogs.stream().map(this::convertToDTO).collect(Collectors.toList());

        return ResponseEntity.ok(catalogDTOs);
    }

    // Método auxiliar para converter Catalog em CatalogDTO
    private CatalogDTO convertToDTO(Catalog catalog) {
        List<OperatingHoursDTO> operatingHoursDTOs = catalog.getOperatingHours().stream()
                .map(oh -> new OperatingHoursDTO(
                        oh.getDayOfWeek(),
                        oh.is24Hours(),
                        oh.isClosed(),
                        oh.getTimeIntervals().stream()
                                .map(ti -> new TimeIntervalDTO(ti.getOpenTime(), ti.getCloseTime()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return new CatalogDTO(
                catalog.getId(),
                catalog.getName(),
                catalog.getNameBoss(),
                catalog.getCnpj(),
                catalog.getEmail(),
                catalog.getPhone(),
                catalog.getAddress().getId(),
                catalog.getOperatingHoursType(),
                operatingHoursDTOs
        );
    }

    @GetMapping("/{catalogId}")
    public ResponseEntity<CatalogDTO> getCatalogById(@PathVariable String catalogId) {
        Optional<Catalog> catalogOpt = catalogService.getCatalogById(catalogId);
        if (catalogOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Catalog catalog = catalogOpt.get();

        // Convert OperatingHours to OperatingHoursDTO
        List<OperatingHoursDTO> operatingHoursDTOList = catalog.getOperatingHours().stream()
                .map(oh -> new OperatingHoursDTO(
                        oh.getDayOfWeek(),
                        oh.is24Hours(),
                        oh.isClosed(),
                        oh.getTimeIntervals().stream()
                                .map(ti -> new TimeIntervalDTO(ti.getOpenTime(), ti.getCloseTime()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        CatalogDTO catalogDTO = new CatalogDTO(
                catalog.getId(),
                catalog.getName(),
                catalog.getNameBoss(),
                catalog.getCnpj(),
                catalog.getEmail(),
                catalog.getPhone(),
                catalog.getAddress().getId(),
                catalog.getOperatingHoursType(),
                operatingHoursDTOList
        );
        return ResponseEntity.ok(catalogDTO);
    }


    @PutMapping("/edit/{id}")
    public ResponseEntity<CatalogDTO> editCatalog(@PathVariable String id, @RequestBody CatalogDTO catalogDTO) {
        Optional<Catalog> updatedCatalogOpt = catalogService.updateCatalog(id, catalogDTO);
        if (updatedCatalogOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Catalog updatedCatalog = updatedCatalogOpt.get();

        // Convert OperatingHours to OperatingHoursDTO
        List<OperatingHoursDTO> operatingHoursDTOList = updatedCatalog.getOperatingHours().stream()
                .map(oh -> new OperatingHoursDTO(
                        oh.getDayOfWeek(),
                        oh.is24Hours(),
                        oh.isClosed(),
                        oh.getTimeIntervals().stream()
                                .map(ti -> new TimeIntervalDTO(ti.getOpenTime(), ti.getCloseTime()))
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        CatalogDTO responseDTO = new CatalogDTO(
                updatedCatalog.getId(),
                updatedCatalog.getName(),
                updatedCatalog.getNameBoss(),
                updatedCatalog.getCnpj(),
                updatedCatalog.getEmail(),
                updatedCatalog.getPhone(),
                updatedCatalog.getAddress().getId(),
                updatedCatalog.getOperatingHoursType(),
                operatingHoursDTOList
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCatalog(@PathVariable String id) {
        catalogService.deleteCatalog(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/release/{id}")
    public ResponseEntity<Void> updateCatalogRelease(@PathVariable String id, @RequestParam boolean released) {
        Optional<Catalog> catalogOpt = catalogService.updateCatalogRelease(id, released);
        if (catalogOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/is-released")
    public ResponseEntity<Boolean> isCatalogReleased(@PathVariable String id) {
        Optional<Catalog> catalogOpt = catalogService.getCatalogById(id);
        if (catalogOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        boolean isReleased = catalogOpt.get().isReleased();
        return ResponseEntity.ok(isReleased);
    }



    @PatchMapping("/visibility/{id}")
    public ResponseEntity<?> updateCatalogVisibility(@PathVariable String id, @RequestParam boolean visible) {
        Optional<Catalog> catalogOpt = catalogService.getCatalogById(id);
        if (catalogOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ExceptionDTO("Catálogo não encontrado", HttpStatus.NOT_FOUND.value()));
        }

        Catalog catalog = catalogOpt.get();
        if (!catalog.isReleased()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ExceptionDTO("A visibilidade só pode ser alterada se o catálogo estiver liberado.", HttpStatus.FORBIDDEN.value()));
        }

        Optional<Catalog> updatedCatalogOpt = catalogService.updateCatalogVisibility(id, visible);
        if (updatedCatalogOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ExceptionDTO("Erro ao atualizar a visibilidade do catálogo.", HttpStatus.NOT_FOUND.value()));
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/is-visible")
    public ResponseEntity<Boolean> isCatalogVisible(@PathVariable String id) {
        Optional<Catalog> catalogOpt = catalogService.getCatalogById(id);
        if (catalogOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        boolean isVisible = catalogOpt.get().isVisible();
        return ResponseEntity.ok(isVisible);
    }

    @GetMapping("/channel/{channelId}/catalogs")
    public ResponseEntity<List<CatalogDTO>> getCatalogsByChannelId(@PathVariable String channelId) {
        List<Catalog> catalogs = catalogService.getCatalogsByChannelId(channelId);

        if (catalogs.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<CatalogDTO> catalogDTOs = catalogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(catalogDTOs);
    }

    @GetMapping("/published/{channelId}")
    public ResponseEntity<List<CatalogDTO>> getPublishedCatalogsByChannelId(@PathVariable String channelId) {
        List<Catalog> catalogs = catalogService.getPublishedCatalogsByChannelId(channelId);

        if (catalogs.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<CatalogDTO> catalogDTOs = catalogs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(catalogDTOs);
    }

}
