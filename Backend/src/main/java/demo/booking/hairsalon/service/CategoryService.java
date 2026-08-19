package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.response.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryResponse> getAllActiveCategories();
    CategoryResponse getCategoryById(UUID id);
}
