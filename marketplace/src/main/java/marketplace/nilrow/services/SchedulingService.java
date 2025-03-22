package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.shipping.scheduling.Scheduling;
import marketplace.nilrow.domain.catalog.shipping.scheduling.SchedulingDTO;
import marketplace.nilrow.domain.catalog.shipping.scheduling.ShippingMode;
import marketplace.nilrow.repositories.CatalogRepository;
import marketplace.nilrow.repositories.SchedulingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SchedulingService {

    @Autowired
    private SchedulingRepository schedulingRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    /**
     * Converte a entidade Scheduling em DTO.
     */
    private SchedulingDTO convertToDTO(Scheduling scheduling) {
        SchedulingDTO dto = new SchedulingDTO();
        dto.setId(scheduling.getId());
        dto.setCatalogId(scheduling.getCatalog().getId());
        dto.setActive(scheduling.isActive());
        dto.setShippingMode(scheduling.getShippingMode());
        return dto;
    }

    /**
     * Converte o DTO em uma entidade Scheduling.
     * Observação: a lista intervals será gerenciada pelo SchedulingIntervalService.
     */
    private Scheduling convertToEntity(SchedulingDTO dto) {
        Scheduling scheduling = new Scheduling();
        Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catálogo não encontrado: " + dto.getCatalogId()));
        scheduling.setCatalog(catalog);
        scheduling.setActive(dto.isActive());
        scheduling.setShippingMode(dto.getShippingMode());
        return scheduling;
    }

    /**
     * Cria um novo Scheduling (sem a regra de só poder 1 por modo).
     */
    public SchedulingDTO create(SchedulingDTO dto) {
        Scheduling scheduling = convertToEntity(dto);
        Scheduling saved = schedulingRepository.save(scheduling);
        return convertToDTO(saved);
    }

    /**
     * Atualiza um Scheduling existente pelo ID.
     */
    public SchedulingDTO update(String id, SchedulingDTO dto) {
        // 1) Busca o Scheduling existente
        Scheduling scheduling = schedulingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scheduling não encontrado: " + id));

        // 2) Se dto.getCatalogId() vier nulo, mantemos o Catalog atual
        if (dto.getCatalogId() != null) {
            Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                    .orElseThrow(() -> new RuntimeException("Catálogo não encontrado: " + dto.getCatalogId()));
            scheduling.setCatalog(catalog);
        }

        // 3) Se o front quiser permitir mudar shippingMode, também checa se não é nulo
        if (dto.getShippingMode() != null) {
            scheduling.setShippingMode(dto.getShippingMode());
        }

        // 4) O campo active normalmente é boolean e não nulo. Se você quer partial, verifique:
        //    - Se o front sempre envia "active"
        //    - Ou se quer checar "hasActive != null" (mas boolean primitivo não aceita null).
        scheduling.setActive(dto.isActive());

        Scheduling updated = schedulingRepository.save(scheduling);
        return convertToDTO(updated);
    }


    /**
     * Busca um Scheduling específico pelo ID.
     */
    public SchedulingDTO findById(String id) {
        Scheduling scheduling = schedulingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scheduling não encontrado: " + id));
        return convertToDTO(scheduling);
    }

    /**
     * Lista todos os Schedulings de um catálogo.
     */
    public List<SchedulingDTO> findByCatalogId(String catalogId) {
        List<Scheduling> schedulings = schedulingRepository.findByCatalog_Id(catalogId);
        return schedulings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Exclui um Scheduling pelo ID.
     */
    public void delete(String id) {
        if (!schedulingRepository.existsById(id)) {
            throw new RuntimeException("Scheduling não encontrado: " + id);
        }
        schedulingRepository.deleteById(id);
    }
}
