from __future__ import annotations

from pydantic import BaseModel, Field


class ExtractedFields(BaseModel):
    name: str | None = None
    style: str | None = None
    abv: float | None = None
    brewery: str | None = None


class DetectionRegion(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int
    confidence: float = Field(ge=0.0, le=1.0)
    label: str = "label"


class ScanExtraction(BaseModel):
    detected_text: str = ""
    fields: ExtractedFields
    confidence: float = Field(ge=0.0, le=1.0)
    notes: list[str] = Field(default_factory=list)
    regions: list[DetectionRegion] = Field(default_factory=list)


class Recipe(BaseModel):
    id: str
    name: str
    style: str
    abv: float | None = None
    ibu: float | None = None
    description: str | None = None
    ingredients: list[str] = Field(default_factory=list)


class RecipeSuggestion(BaseModel):
    recipe: Recipe
    score: float = Field(ge=0.0, le=1.0)
    match_reasons: list[str] = Field(default_factory=list)


class ScanResponse(BaseModel):
    extraction: ScanExtraction
    recommendations: list[RecipeSuggestion] = Field(default_factory=list)
