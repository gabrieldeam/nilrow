package marketplace.nilrow.services;

import marketplace.nilrow.domain.channel.about.About;
import marketplace.nilrow.repositories.AboutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AboutService {

    @Autowired
    private AboutRepository aboutRepository;

    public About createAbout(About about) {
        return aboutRepository.save(about);
    }

    public Optional<About> getAboutByChannelId(String channelId) {
        return aboutRepository.findByChannelId(channelId);
    }

    public Optional<About> getAboutById(String id) {
        return aboutRepository.findById(id);
    }

    public void deleteAbout(String id) {
        aboutRepository.deleteById(id);
    }
}
