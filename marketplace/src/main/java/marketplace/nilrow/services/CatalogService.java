package marketplace.nilrow.services;

import marketplace.nilrow.domain.address.Address;
import marketplace.nilrow.domain.catalog.*;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CatalogService {

    @Autowired
    private CatalogRepository catalogRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private AddressRepository addressRepository;

    public Catalog createCatalog(CatalogDTO catalogDTO, String channelId) {
        // Verifica se o canal existe
        Optional<Channel> channelOpt = channelRepository.findById(channelId);
        if (channelOpt.isEmpty()) {
            throw new RuntimeException("Canal não encontrado");
        }

        Optional<Catalog> existingCatalog = catalogRepository.findByCnpj(catalogDTO.getCnpj());
        if (existingCatalog.isPresent()) {
            throw new RuntimeException("CNPJ já está cadastrado");
        }

        // Cria uma nova instância de Catalog
        Catalog catalog = new Catalog();
        catalog.setChannel(channelOpt.get());
        catalog.setName(catalogDTO.getName());
        catalog.setNameBoss(catalogDTO.getNameBoss());
        catalog.setCnpj(catalogDTO.getCnpj());
        catalog.setEmail(catalogDTO.getEmail());
        catalog.setPhone(catalogDTO.getPhone());

        // Verifica se o endereço existe
        Optional<Address> addressOpt = addressRepository.findById(catalogDTO.getAddressId());
        if (addressOpt.isEmpty()) {
            throw new RuntimeException("Endereço não encontrado");
        }
        catalog.setAddress(addressOpt.get());

        // Define o tipo de horário de funcionamento usando o enum
        if (catalogDTO.getOperatingHoursType() != null) {
            catalog.setOperatingHoursType(catalogDTO.getOperatingHoursType());
        } else {
            throw new RuntimeException("Tipo de horário de funcionamento não pode ser nulo");
        }

        // Configura a lista de horários de funcionamento
        List<OperatingHours> operatingHoursList = new ArrayList<>();
        if (catalogDTO.getOperatingHours() != null) {
            for (OperatingHoursDTO ohDTO : catalogDTO.getOperatingHours()) {
                OperatingHours oh = new OperatingHours();
                oh.setDayOfWeek(ohDTO.getDayOfWeek());
                oh.set24Hours(ohDTO.is24Hours());
                oh.setClosed(ohDTO.isClosed());
                oh.setCatalog(catalog);

                List<TimeInterval> timeIntervals = new ArrayList<>();
                if (ohDTO.getTimeIntervals() != null) {
                    for (TimeIntervalDTO tiDTO : ohDTO.getTimeIntervals()) {
                        TimeInterval ti = new TimeInterval();
                        ti.setOpenTime(tiDTO.getOpenTime());
                        ti.setCloseTime(tiDTO.getCloseTime());
                        ti.setOperatingHours(oh);
                        timeIntervals.add(ti);
                    }
                }
                oh.setTimeIntervals(timeIntervals);
                operatingHoursList.add(oh);
            }
        }
        catalog.setOperatingHours(operatingHoursList);

        // Salva e retorna o catalog criado
        return catalogRepository.save(catalog);
    }


    public Optional<Catalog> getCatalogByChannelId(String channelId) {
        return catalogRepository.findByChannelId(channelId);
    }

    public Optional<Catalog> updateCatalog(String catalogId, CatalogDTO catalogDTO) {
        Optional<Catalog> existingCatalogOpt = catalogRepository.findById(catalogId);
        if (existingCatalogOpt.isPresent()) {
            Catalog catalog = existingCatalogOpt.get();
            if (catalogDTO.getName() != null) {
                catalog.setName(catalogDTO.getName());
            }
            if (catalogDTO.getNameBoss() != null) {
                catalog.setNameBoss(catalogDTO.getNameBoss());
            }
            if (catalogDTO.getCnpj() != null) {
                catalog.setCnpj(catalogDTO.getCnpj());
            }
            if (catalogDTO.getEmail() != null) {
                catalog.setEmail(catalogDTO.getEmail());
            }
            if (catalogDTO.getPhone() != null) {
                catalog.setPhone(catalogDTO.getPhone());
            }
            // Atualiza horários de funcionamento, se fornecidos
            if (catalogDTO.getOperatingHours() != null) {
                List<OperatingHours> operatingHoursList = new ArrayList<>();
                for (OperatingHoursDTO ohDTO : catalogDTO.getOperatingHours()) {
                    OperatingHours oh = new OperatingHours();
                    oh.setDayOfWeek(ohDTO.getDayOfWeek());
                    oh.set24Hours(ohDTO.is24Hours());
                    oh.setClosed(ohDTO.isClosed());
                    oh.setCatalog(catalog);

                    List<TimeInterval> timeIntervals = new ArrayList<>();
                    if (ohDTO.getTimeIntervals() != null) {
                        for (TimeIntervalDTO tiDTO : ohDTO.getTimeIntervals()) {
                            TimeInterval ti = new TimeInterval();
                            ti.setOpenTime(tiDTO.getOpenTime());
                            ti.setCloseTime(tiDTO.getCloseTime());
                            ti.setOperatingHours(oh);
                            timeIntervals.add(ti);
                        }
                    }
                    oh.setTimeIntervals(timeIntervals);
                    operatingHoursList.add(oh);
                }
                catalog.setOperatingHours(operatingHoursList);
            }
            return Optional.of(catalogRepository.save(catalog));
        }
        return Optional.empty();
    }

    public void deleteCatalog(String catalogId) {
        catalogRepository.deleteById(catalogId);
    }

    public Optional<Catalog> updateCatalogRelease(String catalogId, boolean released) {
        Optional<Catalog> catalogOpt = catalogRepository.findById(catalogId);
        if (catalogOpt.isPresent()) {
            Catalog catalog = catalogOpt.get();
            catalog.setReleased(released);
            catalogRepository.save(catalog);
            return Optional.of(catalog);
        }
        return Optional.empty();
    }

    public Optional<Catalog> updateCatalogVisibility(String catalogId, boolean visible) {
        Optional<Catalog> catalogOpt = catalogRepository.findById(catalogId);
        if (catalogOpt.isPresent()) {
            Catalog catalog = catalogOpt.get();
            catalog.setVisible(visible);
            catalogRepository.save(catalog);
            return Optional.of(catalog);
        }
        return Optional.empty();
    }

    public List<Catalog> getCatalogsByVisibility(String channelId, boolean isVisible) {
        return catalogRepository.findByChannelIdAndIsVisible(channelId, isVisible);
    }
}