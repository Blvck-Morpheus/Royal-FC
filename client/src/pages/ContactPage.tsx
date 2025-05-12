import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number is required"),
  position: z.string().min(1, "Please select a position"),
  experience: z.string().min(1, "Please select your experience level"),
  message: z.string().min(10, "Please tell us a bit about yourself"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      message: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest("POST", "/api/contact", data);
      
      if (response.ok) {
        toast({
          title: "Application submitted",
          description: "Thank you for your interest! We'll get back to you soon.",
        });
        
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | Royal FC Asaba</title>
        <meta name="description" content="Contact Royal FC Asaba or apply to join our amateur football club. Find our training schedule and location details." />
      </Helmet>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Contact Us</h1>
            <p className="text-gray-600 mt-2">Join our club or get in touch with us</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Contact Information */}
            <div className="md:col-span-2 bg-royal-light rounded-lg shadow-md p-6">
              <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-4">Get In Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="ri-map-pin-line text-royal-blue text-xl mt-1 mr-3"></i>
                  <div>
                    <h3 className="font-semibold">Training Location</h3>
                    <p className="text-gray-600">Asaba Sports Complex, Central Field</p>
                    <p className="text-gray-600">Asaba, Delta State, Nigeria</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="ri-time-line text-royal-blue text-xl mt-1 mr-3"></i>
                  <div>
                    <h3 className="font-semibold">Training Schedule</h3>
                    <p className="text-gray-600">Tuesdays & Thursdays: 5:00 PM - 7:00 PM</p>
                    <p className="text-gray-600">Saturdays: 3:00 PM - 5:30 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="ri-whatsapp-line text-royal-blue text-xl mt-1 mr-3"></i>
                  <div>
                    <h3 className="font-semibold">WhatsApp Group</h3>
                    <a href="https://chat.whatsapp.com/royal-fc-asaba" className="text-royal-blue hover:text-royal-gold transition duration-200">Join Our Community</a>
                    <p className="text-gray-600 text-sm mt-1">Get updates and connect with members</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="ri-mail-line text-royal-blue text-xl mt-1 mr-3"></i>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <a href="mailto:info@royalfc.com" className="text-royal-blue hover:text-royal-gold transition duration-200">info@royalfc.com</a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-montserrat font-semibold mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="h-10 w-10 rounded-full bg-royal-blue text-white flex items-center justify-center hover:bg-royal-gold transition duration-200">
                    <i className="ri-instagram-line"></i>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-royal-blue text-white flex items-center justify-center hover:bg-royal-gold transition duration-200">
                    <i className="ri-twitter-x-line"></i>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-royal-blue text-white flex items-center justify-center hover:bg-royal-gold transition duration-200">
                    <i className="ri-facebook-fill"></i>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-royal-blue text-white flex items-center justify-center hover:bg-royal-gold transition duration-200">
                    <i className="ri-youtube-line"></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Join the Club Form */}
            <div className="md:col-span-3 bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Join Royal FC</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Position</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                              <SelectItem value="defender">Defender</SelectItem>
                              <SelectItem value="midfielder">Midfielder</SelectItem>
                              <SelectItem value="forward">Forward</SelectItem>
                              <SelectItem value="multiple">Multiple Positions</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Football Experience</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                            <SelectItem value="recreational">Recreational - Play occasionally</SelectItem>
                            <SelectItem value="intermediate">Intermediate - Played in school/college</SelectItem>
                            <SelectItem value="advanced">Advanced - Played competitively</SelectItem>
                            <SelectItem value="professional">Professional - Played at professional level</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why do you want to join Royal FC?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a bit about yourself and why you want to join our club" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the club's <a href="#" className="text-royal-blue hover:text-royal-gold">terms and conditions</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-royal-blue hover:bg-royal-blue/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
