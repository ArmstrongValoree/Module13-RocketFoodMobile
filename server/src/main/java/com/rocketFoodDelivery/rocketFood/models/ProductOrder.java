package com.rocketFoodDelivery.rocketFood.models;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "product_orders" , uniqueConstraints = {
        @UniqueConstraint(columnNames = {"product_id", "order_id"})
})
public class ProductOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(cascade = CascadeType.REMOVE)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "product_id")
    private Product product;


    @ManyToOne(cascade = CascadeType.REMOVE)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    @Min(1)
    private Integer product_quantity;
    @Min(0)
    private Integer product_unit_cost;

    // Getters for the fields
    public Integer getProductQuantity() {
        return product_quantity;
    }

    public Integer getProductUnitCost() {
        return product_unit_cost;
    }

    @PrePersist
    private void validateBeforePersist() {
        if (!productBelongsToRestaurant()) {
            throw new IllegalArgumentException("ProductOrder instance is not valid");
        }
    }

    private boolean productBelongsToRestaurant() {
        if (product == null || order == null || 
            product.getRestaurant() == null || order.getRestaurant() == null) {
            return false;
        }
        return product.getRestaurant().getId() == order.getRestaurant().getId();
    }

}

