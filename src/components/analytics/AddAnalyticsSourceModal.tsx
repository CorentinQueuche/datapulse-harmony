
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Info, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddAnalyticsSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  property_id: z.string().min(2, { message: 'L\'ID de propriété est requis' }),
  view_id: z.string().optional(),
  sync_frequency: z.enum(['manual', 'daily', 'weekly', 'monthly']),
  service_account_json: z.string().min(10, { message: 'Le JSON du compte de service est requis' }),
});

type FormValues = z.infer<typeof formSchema>;

const AddAnalyticsSourceModal: React.FC<AddAnalyticsSourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      property_id: '',
      view_id: '',
      sync_frequency: 'daily',
      service_account_json: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Valider que le JSON est correct
      let serviceAccountJson;
      try {
        serviceAccountJson = JSON.parse(values.service_account_json);
      } catch (e) {
        toast({
          title: "JSON invalide",
          description: "Le format du JSON du compte de service est incorrect.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const { error } = await supabase.from('analytics_sources').insert({
        user_id: user.id,
        name: values.name,
        property_id: values.property_id,
        view_id: values.view_id || null,
        sync_frequency: values.sync_frequency,
        credentials: serviceAccountJson,
      });
      
      if (error) throw error;
      
      toast({
        title: "Source ajoutée",
        description: "La source d'analytics a été ajoutée avec succès.",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la source.",
        variant: "destructive",
      });
      console.error("Erreur d'ajout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter une source Google Analytics</DialogTitle>
          <DialogDescription>
            Connectez votre propriété Google Analytics pour visualiser vos données dans le tableau de bord.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md text-sm flex items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium mb-1">Configuration requise</p>
                <p className="text-blue-700">
                  Vous devez créer un compte de service Google avec accès à l'API Google Analytics 
                  et générer une clé JSON pour ce compte de service.
                </p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la source</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mon site web principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID de propriété GA4</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="view_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID de vue (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="sync_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence de synchronisation</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une fréquence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manuel</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="service_account_json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clé JSON du compte de service</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Collez le JSON ici..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-analytics-blue hover:bg-analytics-blue/90 text-white"
              >
                {isSubmitting ? 'Enregistrement...' : 'Ajouter la source'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnalyticsSourceModal;
