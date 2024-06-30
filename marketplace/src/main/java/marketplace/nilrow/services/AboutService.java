package marketplace.nilrow.services;

import marketplace.nilrow.domain.channel.*;
import marketplace.nilrow.domain.channel.about.About;
import marketplace.nilrow.domain.channel.about.Category;
import marketplace.nilrow.domain.channel.about.FAQ;
import marketplace.nilrow.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AboutService {

    @Autowired
    private AboutRepository aboutRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FAQRepository faqRepository;

    public About createAbout(About about) {
        return aboutRepository.save(about);
    }

    public Optional<About> getAboutByChannel(Channel channel) {
        return aboutRepository.findByChannel(channel);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public FAQ addFAQ(FAQ faq) {
        return faqRepository.save(faq);
    }

    public void deleteFAQ(Long faqId) {
        faqRepository.deleteById(faqId);
    }
}