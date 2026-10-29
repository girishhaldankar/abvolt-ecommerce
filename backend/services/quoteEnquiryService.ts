import { Types } from "mongoose";
import { Division } from "../models/Division";
import {
  QuoteEnquiry,
  QUOTE_ENQUIRY_STATUSES,
} from "../models/QuoteEnquiry";

const MAX_QUANTITY = 100000;
const MAX_PAGE_SIZE = 50;
const PHONE_CHARACTERS = /^[+0-9().\-\s]+$/;

const SHOP_PRODUCTS: Record<
  string,
  { name: string; category: string }
> = {
  "1": { name: "Arduino Uno R3 Development Board", category: "Development Boards" },
  "2": { name: "Raspberry Pi 4 Model B 8GB", category: "Development Boards" },
  "3": { name: "Ultrasonic Distance Sensor HC-SR04", category: "Sensors" },
  "4": { name: "DHT22 Temperature & Humidity Sensor", category: "Sensors" },
  "5": { name: "18650 Li-ion Battery 3.7V 3000mAh", category: "Battery & Power" },
  "6": { name: "TP4056 Li-ion Battery Charger Module", category: "Battery & Power" },
  "7": { name: "L298N Dual H-Bridge Motor Driver", category: "Motors & Drivers" },
  "8": { name: "NEMA 17 Stepper Motor", category: "Motors & Drivers" },
  "9": { name: "Advanced Circuit Board Kit", category: "Components" },
  "10": { name: "Resistor Kit 600pcs Assorted", category: "Components" },
  "11": { name: "ESP32 WiFi Bluetooth Module", category: "IoT Modules" },
  "12": { name: "NodeMCU ESP8266 Development Board", category: "IoT Modules" },
  "13": { name: "Robot Car Chassis Kit with Motors", category: "Robotics Parts" },
  "14": { name: "Metal Servo Bracket U-Shape", category: "Robotics Parts" },
  "15": { name: "Professional Soldering Station Kit", category: "Tools & Accessories" },
  "16": { name: "Digital Multimeter Auto-Ranging", category: "Tools & Accessories" },
  "17": { name: "PLA 3D Printer Filament 1kg", category: "3D Printing" },
  "18": { name: "Brass Nozzle Set 0.2-1.0mm", category: "3D Printing" },
  "19": { name: '0.96" OLED Display Module I2C', category: "Displays & Screens" },
  "20": { name: "16x2 LCD Display Blue Backlight", category: "Displays & Screens" },
  "21": { name: "HC-05 Bluetooth Module", category: "Wireless Modules" },
  "22": { name: "NRF24L01 2.4GHz Wireless Module", category: "Wireless Modules" },
  "23": { name: "5V 2.4A USB Fast Charger Adapter", category: "Power Supplies" },
};

export class QuoteEnquiryError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "QuoteEnquiryError";
  }
}

type QuoteSource = "division" | "shop";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(
  value: unknown,
  field: string,
  maxLength: number
): string {
  if (typeof value !== "string") {
    throw new QuoteEnquiryError(`${field} is required.`, 400);
  }

  const normalized = value.trim();
  if (!normalized) throw new QuoteEnquiryError(`${field} is required.`, 400);
  if (normalized.length > maxLength) {
    throw new QuoteEnquiryError(`${field} must be ${maxLength} characters or fewer.`, 400);
  }
  return normalized;
}

function optionalText(value: unknown, field: string, maxLength: number): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    throw new QuoteEnquiryError(`${field} must be text.`, 400);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new QuoteEnquiryError(`${field} must be ${maxLength} characters or fewer.`, 400);
  }
  return normalized;
}

function validatePhone(value: unknown): string {
  const phone = requiredText(value, "Phone number", 32);
  const digitCount = phone.replace(/\D/g, "").length;
  if (!PHONE_CHARACTERS.test(phone) || digitCount < 7 || digitCount > 15) {
    throw new QuoteEnquiryError("Enter a valid phone number.", 400);
  }
  return phone;
}

function validateQuantity(value: unknown): number {
  const quantity =
    typeof value === "number" || (typeof value === "string" && value.trim())
      ? Number(value)
      : Number.NaN;
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_QUANTITY
  ) {
    throw new QuoteEnquiryError(
      `Quantity must be a whole number between 1 and ${MAX_QUANTITY}.`,
      400
    );
  }
  return quantity;
}

function validateObjectId(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    throw new QuoteEnquiryError(`${field} is invalid.`, 400);
  }
  return value;
}

function normalizeSource(value: unknown): QuoteSource {
  if (value !== "division" && value !== "shop") {
    throw new QuoteEnquiryError("Item source is invalid.", 400);
  }
  return value;
}

async function getTrustedItem(input: Record<string, unknown>, source: QuoteSource) {
  if (source === "shop") {
    const itemId = requiredText(input.itemId, "Product", 64);
    const product = SHOP_PRODUCTS[itemId];
    if (!product) throw new QuoteEnquiryError("Product not found.", 404);
    return {
      itemId,
      itemName: product.name,
      itemCode: "",
      itemCategory: product.category,
    };
  }

  const divisionId = validateObjectId(input.divisionId, "Division ID");
  const audienceId = validateObjectId(input.audienceId, "Audience ID");
  const streamId = validateObjectId(input.streamId, "Stream ID");
  const categoryId = validateObjectId(input.categoryId, "Category ID");
  const itemId = validateObjectId(input.itemId, "Item ID");

  if (!Types.ObjectId.isValid(divisionId)) {
    throw new QuoteEnquiryError("Division ID is invalid.", 400);
  }

  const division: any = await Division.findById(divisionId).lean();
  if (!division) throw new QuoteEnquiryError("Catalogue item not found.", 404);

  const audience = division.audiences?.find(
    (entry: any) => String(entry._id).toLowerCase() === audienceId.toLowerCase()
  );
  const stream = audience?.streams?.find(
    (entry: any) => String(entry._id).toLowerCase() === streamId.toLowerCase()
  );
  const category = stream?.categories?.find(
    (entry: any) => String(entry._id).toLowerCase() === categoryId.toLowerCase()
  );
  const item = category?.items?.find(
    (entry: any) => String(entry._id).toLowerCase() === itemId.toLowerCase()
  );

  if (!item) throw new QuoteEnquiryError("Catalogue item not found.", 404);

  const itemName = item.title || item.name;
  if (typeof itemName !== "string" || !itemName.trim()) {
    throw new QuoteEnquiryError("Catalogue item has no valid name.", 422);
  }

  return {
    itemId,
    itemName: itemName.trim().slice(0, 200),
    itemCode: typeof item.code === "string" ? item.code.trim().slice(0, 100) : "",
    itemCategory: typeof category.title === "string" ? category.title.trim().slice(0, 120) : "",
    divisionId,
    audienceId,
    streamId,
    categoryId,
  };
}

export async function createQuoteEnquiry(payload: unknown) {
  if (!isRecord(payload)) throw new QuoteEnquiryError("Request body is invalid.", 400);

  const source = normalizeSource(payload.itemSource);
  const customerName = requiredText(payload.customerName, "Name", 120);
  const phone = validatePhone(payload.phone);
  const quantity = validateQuantity(payload.quantity);
  const requirements = optionalText(payload.requirements, "Requirements", 2000);
  const item = await getTrustedItem(payload, source);

  const saved = await QuoteEnquiry.create({
    customerName,
    phone,
    quantity,
    requirements,
    itemSource: source,
    ...item,
  });

  return {
    id: String(saved._id),
    status: saved.status,
    createdAt: saved.createdAt,
  };
}

export async function listQuoteEnquiries(
  pageValue: unknown,
  pageSizeValue: unknown,
  statusValue?: unknown
) {
  const page = Number(pageValue ?? 1);
  const pageSize = Number(pageSizeValue ?? 25);
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new QuoteEnquiryError("Page must be a positive whole number.", 400);
  }
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new QuoteEnquiryError(`Page size must be between 1 and ${MAX_PAGE_SIZE}.`, 400);
  }

  const filter: Record<string, string> = {};
  if (statusValue !== undefined && statusValue !== "") {
    if (
      typeof statusValue !== "string" ||
      !QUOTE_ENQUIRY_STATUSES.includes(
        statusValue as (typeof QUOTE_ENQUIRY_STATUSES)[number]
      )
    ) {
      throw new QuoteEnquiryError("Enquiry status is invalid.", 400);
    }
    filter.status = statusValue;
  }

  const [items, total] = await Promise.all([
    QuoteEnquiry.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    QuoteEnquiry.countDocuments(filter),
  ]);

  return { items, page, pageSize, total };
}

export async function getQuoteEnquiryById(idValue: unknown) {
  if (
    typeof idValue !== "string" ||
    !/^[a-f\d]{24}$/i.test(idValue) ||
    !Types.ObjectId.isValid(idValue)
  ) {
    throw new QuoteEnquiryError("Enquiry ID is invalid.", 400);
  }
  const enquiry = await QuoteEnquiry.findById(idValue).lean();
  if (!enquiry) throw new QuoteEnquiryError("Enquiry not found.", 404);
  return enquiry;
}

export async function updateQuoteEnquiryStatus(
  idValue: unknown,
  statusValue: unknown
) {
  if (
    typeof idValue !== "string" ||
    !/^[a-f\d]{24}$/i.test(idValue) ||
    !Types.ObjectId.isValid(idValue)
  ) {
    throw new QuoteEnquiryError("Enquiry ID is invalid.", 400);
  }
  if (
    typeof statusValue !== "string" ||
    !QUOTE_ENQUIRY_STATUSES.includes(
      statusValue as (typeof QUOTE_ENQUIRY_STATUSES)[number]
    )
  ) {
    throw new QuoteEnquiryError("Enquiry status is invalid.", 400);
  }

  const updated = await QuoteEnquiry.findByIdAndUpdate(
    idValue,
    { $set: { status: statusValue, statusUpdatedAt: new Date() } },
    { new: true, runValidators: true }
  ).lean();
  if (!updated) throw new QuoteEnquiryError("Enquiry not found.", 404);
  return updated;
}
