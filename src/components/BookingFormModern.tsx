"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  KeyRound, 
  UserPlus, 
  UserMinus,
  Wallet,
  Info,
  HelpCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Flight {
  id?: string;
  airline: string;
  flightNumber: string;
  departureTime: any; // Could be string, Date or Firestore timestamp
  arrivalTime: any; // Could be string, Date or Firestore timestamp
  fromCity: string;
  toCity: string;
  price: number;
  duration: string | number;
  [key: string]: any;
}

interface Passenger {
  name: string;
  email: string;
  phone: string;
  gender?: string;
  age?: string;
  meal?: string;
}

interface BookingFormData {
  passengers: Passenger[];
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  paymentMethod: 'wallet' | 'card';
}

interface BookingFormProps {
  flight: Flight;
  onSubmit: (data: any) => void;
}

interface FormErrors {
  [key: string]: string | null;
}

export default function BookingFormModern({ flight, onSubmit }: BookingFormProps) {
  const { userProfile, updateUserWallet } = useAuth() as any;
  const [passengersCount, setPassengersCount] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    passengers: [
      {
        name: '',
        email: '',
        phone: '',
        gender: 'male',
        age: '',
        meal: 'standard'
      }
    ],
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'wallet'
  });

  const [formStage, setFormStage] = useState(1);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        passengers: [
          {
            name: userProfile.displayName || '',
            email: userProfile.email || '',
            phone: '',
            gender: 'male',
            age: '',
            meal: 'standard'
          },
          ...prev.passengers.slice(1)
        ]
      }));
    }
  }, [userProfile]);

  // Handle passenger count changes
  useEffect(() => {
    // Add or remove passenger entries when count changes
    const currentPassengers = [...formData.passengers];
    
    if (passengersCount > currentPassengers.length) {
      // Add new passengers
      const newPassengers = [...currentPassengers];
      for (let i = currentPassengers.length; i < passengersCount; i++) {
        newPassengers.push({ 
          name: '', 
          email: '', 
          phone: '',
          gender: 'male',
          age: '',
          meal: 'standard'
        });
      }
      setFormData(prev => ({ ...prev, passengers: newPassengers }));
    } else if (passengersCount < currentPassengers.length) {
      // Remove passengers
      setFormData(prev => ({ 
        ...prev, 
        passengers: currentPassengers.slice(0, passengersCount) 
      }));
    }
  }, [passengersCount]);

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      passengers: updatedPassengers
    }));
    
    // Clear error for this field
    if (formErrors[`passenger${index}_${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`passenger${index}_${field}`]: null
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateStage1 = () => {
    const errors: FormErrors = {};
    
    // Validate each passenger's information
    formData.passengers.forEach((passenger, index) => {
      if (!passenger.name.trim()) {
        errors[`passenger${index}_name`] = 'Name is required';
      }
      
      if (!passenger.email.trim()) {
        errors[`passenger${index}_email`] = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(passenger.email)) {
        errors[`passenger${index}_email`] = 'Email is invalid';
      }
      
      if (!passenger.phone.trim()) {
        errors[`passenger${index}_phone`] = 'Phone is required';
      } else if (!/^\d{10}$/.test(passenger.phone)) {
        errors[`passenger${index}_phone`] = 'Phone must be 10 digits';
      }

      if (passenger.age && passenger.age.trim() !== '' && isNaN(Number(passenger.age))) {
        errors[`passenger${index}_age`] = 'Age must be a number';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStage2 = () => {
    const errors: FormErrors = {};
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber)) {
        errors.cardNumber = 'Card number must be 16 digits';
      }
      
      if (!formData.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = 'Format must be MM/YY';
      }
      
      if (!formData.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = 'CVV must be 3 or 4 digits';
      }
    } else if (formData.paymentMethod === 'wallet') {
      // Calculate total price for all passengers
      const pricePerPassenger = flight && flight.price ? flight.price + Math.round(flight.price * 0.18) : 0;
      const totalPrice = pricePerPassenger * passengersCount;
      
      const walletBalance = userProfile ? (userProfile.walletBalance || userProfile.wallet || 0) : 0;
      if (!userProfile || walletBalance < totalPrice) {
        errors.wallet = `Insufficient wallet balance for ${passengersCount} passengers`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStage1()) {
      setFormStage(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStage2()) return;
    
    try {
      setIsProcessing(true);
      
      // Calculate total price for all passengers
      const pricePerPassenger = flight && flight.price ? flight.price + Math.round(flight.price * 0.18) : 0;
      const totalPrice = pricePerPassenger * passengersCount;
      
      // If wallet payment, update wallet balance
      if (formData.paymentMethod === 'wallet') {
        await updateUserWallet(totalPrice);
      }
      
      // Submit booking data with all passengers
      onSubmit({
        ...formData,
        passengersCount,
        flight,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed',
        paymentAmount: totalPrice
      });
    } catch (error: any) {
      setFormErrors({
        submission: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate ticket price
  const ticketPrice = flight && flight.price ? flight.price + Math.round(flight.price * 0.18) : 0;
  const totalPrice = ticketPrice * passengersCount;

  return (
    <Card className="w-full border-border rounded-xl shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-1">
          <div className="flex-1 text-lg sm:text-xl">
            {formStage === 1 ? "Passenger Details" : "Payment Information"}
          </div>
          <Badge variant="outline" className="ml-auto hidden sm:flex">
            {formStage} of 2
          </Badge>
        </CardTitle>
        <CardDescription>
          {formStage === 1 
            ? "Please provide details for all passengers" 
            : "Choose your payment method and complete your booking"}
        </CardDescription>
        <div className="mt-2 flex">
          <div className="w-full flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${formStage >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <div className={`h-1 flex-1 mx-1 transition-colors ${formStage >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${formStage >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {formErrors.submission && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20 flex items-start">
            <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{formErrors.submission}</p>
          </div>
        )}

        {formStage === 1 ? (
          <form onSubmit={proceedToPayment}>
            <div className="mb-4 flex justify-between items-center">
              <Label className="text-sm font-medium">
                Number of Passengers
              </Label>
              <div className="flex items-center border rounded-md">
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-none rounded-l-md"
                  onClick={() => setPassengersCount(Math.max(1, passengersCount - 1))}
                  disabled={passengersCount <= 1}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
                
                <span className="flex items-center justify-center w-8 h-8 text-center">
                  {passengersCount}
                </span>
                
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-none rounded-r-md"
                  onClick={() => setPassengersCount(Math.min(9, passengersCount + 1))}
                  disabled={passengersCount >= 9}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-6 space-y-6">
              {formData.passengers.map((passenger, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium">Passenger {index + 1}</h3>
                    {passengersCount > 1 && (
                      <Badge variant={index === 0 ? "secondary" : "outline"}>
                        {index === 0 ? "Primary" : `Passenger ${index + 1}`}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`passenger${index}_name`} className="text-sm font-medium block mb-1">
                        Full Name
                      </Label>
                      <div className="relative">
                        <Input
                          id={`passenger${index}_name`}
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          placeholder="Enter full name"
                          className={`pl-9 ${formErrors[`passenger${index}_name`] ? 'border-destructive' : ''}`}
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formErrors[`passenger${index}_name`] && (
                        <p className="mt-1 text-xs text-destructive">
                          {formErrors[`passenger${index}_name`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`passenger${index}_email`} className="text-sm font-medium block mb-1">
                        Email
                      </Label>
                      <div className="relative">
                        <Input
                          id={`passenger${index}_email`}
                          type="email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                          placeholder="Email address"
                          className={`pl-9 ${formErrors[`passenger${index}_email`] ? 'border-destructive' : ''}`}
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formErrors[`passenger${index}_email`] && (
                        <p className="mt-1 text-xs text-destructive">
                          {formErrors[`passenger${index}_email`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`passenger${index}_phone`} className="text-sm font-medium block mb-1">
                        Phone
                      </Label>
                      <div className="relative">
                        <Input
                          id={`passenger${index}_phone`}
                          value={passenger.phone}
                          onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                          placeholder="10-digit phone number"
                          className={`pl-9 ${formErrors[`passenger${index}_phone`] ? 'border-destructive' : ''}`}
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formErrors[`passenger${index}_phone`] && (
                        <p className="mt-1 text-xs text-destructive">
                          {formErrors[`passenger${index}_phone`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`passenger${index}_gender`} className="text-sm font-medium block mb-1">
                        Gender
                      </Label>
                      <Select
                        value={passenger.gender}
                        onValueChange={(value) => handlePassengerChange(index, 'gender', value)}
                      >
                        <SelectTrigger id={`passenger${index}_gender`}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`passenger${index}_age`} className="text-sm font-medium block mb-1">
                        Age (Optional)
                      </Label>
                      <Input
                        id={`passenger${index}_age`}
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        placeholder="Age"
                        className={formErrors[`passenger${index}_age`] ? 'border-destructive' : ''}
                      />
                      {formErrors[`passenger${index}_age`] && (
                        <p className="mt-1 text-xs text-destructive">
                          {formErrors[`passenger${index}_age`]}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`passenger${index}_meal`} className="text-sm font-medium block mb-1">
                        Meal Preference
                      </Label>
                      <Select
                        value={passenger.meal}
                        onValueChange={(value) => handlePassengerChange(index, 'meal', value)}
                      >
                        <SelectTrigger id={`passenger${index}_meal`}>
                          <SelectValue placeholder="Select meal preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="halal">Halal</SelectItem>
                          <SelectItem value="kosher">Kosher</SelectItem>
                          <SelectItem value="diabetic">Diabetic</SelectItem>
                          <SelectItem value="gluten-free">Gluten Free</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isProcessing}
              >
                Continue to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Ticket price x {passengersCount}</span>
                  <span className="font-medium">₹{(flight.price * passengersCount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Taxes & fees</span>
                  <span className="font-medium">₹{(Math.round(flight.price * 0.18) * passengersCount).toLocaleString()}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total amount</span>
                  <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium block mb-2">
                    Payment Method
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        formData.paymentMethod === 'wallet'
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => setFormData({...formData, paymentMethod: 'wallet'})}
                    >
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">Pay with Wallet</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Balance: ₹{userProfile?.walletBalance?.toLocaleString() || 0}
                      </p>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        formData.paymentMethod === 'card'
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                      onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                    >
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">Credit Card</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Secure payment
                      </p>
                    </div>
                  </div>
                  {formErrors.wallet && (
                    <p className="mt-2 text-sm text-destructive flex items-start">
                      <Info className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      {formErrors.wallet}
                    </p>
                  )}
                </div>
                
                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm font-medium block mb-1">
                        Card Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                          className={`pl-9 ${formErrors.cardNumber ? 'border-destructive' : ''}`}
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      {formErrors.cardNumber && (
                        <p className="mt-1 text-xs text-destructive">
                          {formErrors.cardNumber}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm font-medium block mb-1">
                          Expiry Date
                        </Label>
                        <div className="relative">
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={`pl-9 ${formErrors.expiryDate ? 'border-destructive' : ''}`}
                          />
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {formErrors.expiryDate && (
                          <p className="mt-1 text-xs text-destructive">
                            {formErrors.expiryDate}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="cvv" className="text-sm font-medium">CVV</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <HelpCircle className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">
                                The CVV is the 3 or 4 digit security code on the back of your card.
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="relative">
                          <Input
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            maxLength={4}
                            className={`pl-9 ${formErrors.cvv ? 'border-destructive' : ''}`}
                          />
                          <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {formErrors.cvv && (
                          <p className="mt-1 text-xs text-destructive">
                            {formErrors.cvv}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormStage(1)}
                className="order-2 sm:order-1"
              >
                Back
              </Button>
              
              <Button 
                type="submit" 
                className="order-1 sm:order-2 sm:flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Complete Booking
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 