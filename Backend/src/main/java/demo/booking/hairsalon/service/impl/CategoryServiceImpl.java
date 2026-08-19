package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.request.CategoryRequest;
import demo.booking.hairsalon.model.dto.response.CategoryResponse;
import demo.booking.hairsalon.model.entity.Category;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.CategoryRepository;
import demo.booking.hairsalon.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getAllCategoriesAdmin() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));
        return mapToResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.name())
                .description(request.description())
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));

        category.setName(request.name());
        category.setDescription(request.description());
        if (request.isActive() != null) {
            category.setActive(request.isActive());
        }
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive()
        );
    }
}
