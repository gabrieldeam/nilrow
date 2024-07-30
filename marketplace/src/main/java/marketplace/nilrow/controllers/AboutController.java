package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.channel.about.About;
import marketplace.nilrow.domain.channel.about.dto.AboutDTO;
import marketplace.nilrow.repositories.ChannelRepository;
import marketplace.nilrow.services.AboutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/about")
@Tag(name = "Channel", description = "Operações relacionadas ao canal")
public class AboutController {

    @Autowired
    private AboutService aboutService;

    @Autowired
    private ChannelRepository channelRepository;

    @PostMapping("/create")
    public ResponseEntity<AboutDTO> createAbout(@RequestBody AboutDTO aboutDTO) {
        Optional<Channel> channelOpt = channelRepository.findById(aboutDTO.getChannelId());
        if (channelOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        About about = new About();
        about.setChannel(channelOpt.get());

        // Apenas atualize se o valor não for nulo
        if (aboutDTO.getAboutText() != null) {
            about.setAboutText(aboutDTO.getAboutText());
        }
        if (aboutDTO.getStorePolicies() != null) {
            about.setStorePolicies(aboutDTO.getStorePolicies());
        }
        if (aboutDTO.getExchangesAndReturns() != null) {
            about.setExchangesAndReturns(aboutDTO.getExchangesAndReturns());
        }
        if (aboutDTO.getAdditionalInfo() != null) {
            about.setAdditionalInfo(aboutDTO.getAdditionalInfo());
        }

        About savedAbout = aboutService.createAbout(about);
        AboutDTO responseDTO = new AboutDTO(
                savedAbout.getId(),
                savedAbout.getChannel().getId(),
                savedAbout.getAboutText(),
                savedAbout.getStorePolicies(),
                savedAbout.getExchangesAndReturns(),
                savedAbout.getAdditionalInfo()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/{channelId}")
    public ResponseEntity<AboutDTO> getAboutByChannelId(@PathVariable String channelId) {
        Optional<About> aboutOpt = aboutService.getAboutByChannelId(channelId);
        if (aboutOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        About about = aboutOpt.get();
        AboutDTO aboutDTO = new AboutDTO(
                about.getId(),
                about.getChannel().getId(),
                about.getAboutText(),
                about.getStorePolicies(),
                about.getExchangesAndReturns(),
                about.getAdditionalInfo()
        );

        return ResponseEntity.ok(aboutDTO);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<AboutDTO> editAbout(@PathVariable String id, @RequestBody AboutDTO aboutDTO) {
        Optional<About> aboutOpt = aboutService.getAboutById(id);
        if (aboutOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        About about = aboutOpt.get();

        // Atualize apenas os campos não nulos do DTO
        if (aboutDTO.getAboutText() != null) {
            about.setAboutText(aboutDTO.getAboutText());
        }
        if (aboutDTO.getStorePolicies() != null) {
            about.setStorePolicies(aboutDTO.getStorePolicies());
        }
        if (aboutDTO.getExchangesAndReturns() != null) {
            about.setExchangesAndReturns(aboutDTO.getExchangesAndReturns());
        }
        if (aboutDTO.getAdditionalInfo() != null) {
            about.setAdditionalInfo(aboutDTO.getAdditionalInfo());
        }

        About updatedAbout = aboutService.createAbout(about);
        AboutDTO responseDTO = new AboutDTO(
                updatedAbout.getId(),
                updatedAbout.getChannel().getId(),
                updatedAbout.getAboutText(),
                updatedAbout.getStorePolicies(),
                updatedAbout.getExchangesAndReturns(),
                updatedAbout.getAdditionalInfo()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAbout(@PathVariable String id) {
        aboutService.deleteAbout(id);
        return ResponseEntity.ok().build();
    }
}
