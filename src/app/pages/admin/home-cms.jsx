import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { 
  Save, Image as ImageIcon, Plus, Edit, Trash2, Eye, LayoutTemplate, 
  UploadCloud, GripVertical, CheckCircle2, XCircle 
} from "lucide-react";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SheetTrigger
} from "../../components/ui/sheet";

import heroData from "../../data/hero.json";
import turfsData from "../../data/featuredTurfs.json";
import sportsData from "../../data/sports.json";
import promosData from "../../data/promotions.json";
import testimonialsData from "../../data/testimonials.json";
import footerData from "../../data/footer.json";

export function AdminHomeCMS() {
  const [hero, setHero] = useState(heroData);
  const [turfs, setTurfs] = useState(turfsData);
  const [sports, setSports] = useState(sportsData);
  const [promos, setPromos] = useState(promosData);
  const [testimonials, setTestimonials] = useState(testimonialsData);
  const [footer, setFooter] = useState(footerData);

  const [editingTurf, setEditingTurf] = useState(null);

  const handleSave = () => {
     alert("Settings saved successfully! Data is ready for backend API submission.");
  };

  const handleHeroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHero(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTurfToggle = (id, field) => {
    setTurfs(turfs.map(t => t.id === id ? { ...t, [field]: !t[field] } : t));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Home Page CMS</h2>
          <p className="text-muted-foreground">Manage all content and layout for the home page.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" /> Live Preview
          </Button>
          <Button className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" /> Publish Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto p-1 bg-muted/50 w-full justify-start overflow-x-auto gap-2">
          <TabsTrigger value="hero">Hero Banner</TabsTrigger>
          <TabsTrigger value="turfs">Featured Turfs</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* HERO TAB */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Edit the main banner and call to action.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h4 className="font-medium">Enable Hero Section</h4>
                  <p className="text-sm text-muted-foreground">Show or hide this section on the home page.</p>
                </div>
                <Switch checked={hero.enabled} onCheckedChange={(c) => setHero({...hero, enabled: c})} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Desktop Banner URL</Label>
                    <div className="flex gap-2">
                      <Input name="desktopBanner" value={hero.desktopBanner} onChange={handleHeroChange} />
                      <Button variant="secondary" size="icon"><UploadCloud className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Banner URL</Label>
                    <div className="flex gap-2">
                      <Input name="mobileBanner" value={hero.mobileBanner} onChange={handleHeroChange} />
                      <Button variant="secondary" size="icon"><UploadCloud className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input name="heading" value={hero.heading} onChange={handleHeroChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub Heading</Label>
                    <Input name="subHeading" value={hero.subHeading} onChange={handleHeroChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input name="buttonText" value={hero.buttonText} onChange={handleHeroChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Link</Label>
                      <Input name="buttonLink" value={hero.buttonLink} onChange={handleHeroChange} />
                    </div>
                  </div>
                </div>
                <div className="border border-border/40 rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden h-[300px]">
                  <img src={hero.desktopBanner} alt="Hero Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  <div className="relative z-10 text-center space-y-4 p-6">
                    <h1 className="text-3xl font-bold">{hero.heading}</h1>
                    <p>{hero.subHeading}</p>
                    <Button>{hero.buttonText}</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEATURED TURFS TAB */}
        <TabsContent value="turfs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Featured Turfs</CardTitle>
                <CardDescription>Manage the turfs displayed on the home page.</CardDescription>
              </div>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Turf</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {turfs.map(turf => (
                      <TableRow key={turf.id}>
                        <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
                        <TableCell>
                          <div className="w-16 h-10 rounded overflow-hidden">
                            <img src={turf.image} alt={turf.name} className="w-full h-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{turf.name}</TableCell>
                        <TableCell>₹{turf.price}</TableCell>
                        <TableCell>
                          <Switch checked={turf.visibility} onCheckedChange={() => handleTurfToggle(turf.id, 'visibility')} />
                        </TableCell>
                        <TableCell>
                          <Switch checked={turf.featuredBadge} onCheckedChange={() => handleTurfToggle(turf.id, 'featuredBadge')} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setEditingTurf(turf)}><Edit className="h-4 w-4" /></Button>
                              </SheetTrigger>
                              <SheetContent className="sm:max-w-xl overflow-y-auto">
                                <SheetHeader>
                                  <SheetTitle>Edit Turf Card</SheetTitle>
                                  <SheetDescription>Update the details shown for this turf on the home page.</SheetDescription>
                                </SheetHeader>
                                {editingTurf && (
                                  <div className="py-6 space-y-4">
                                    <div className="space-y-2">
                                      <Label>Turf Name</Label>
                                      <Input defaultValue={editingTurf.name} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Area</Label>
                                        <Input defaultValue={editingTurf.area} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Price (₹)</Label>
                                        <Input type="number" defaultValue={editingTurf.price} />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Image URL</Label>
                                      <div className="flex gap-2">
                                        <Input defaultValue={editingTurf.image} />
                                        <Button variant="secondary"><UploadCloud className="h-4 w-4" /></Button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-4">
                                      <div className="flex items-center gap-2">
                                        <Switch defaultChecked={editingTurf.visibility} />
                                        <Label>Visible</Label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch defaultChecked={editingTurf.featuredBadge} />
                                        <Label>Featured Badge</Label>
                                      </div>
                                    </div>
                                    <div className="pt-6 flex justify-end gap-2">
                                      <SheetClose asChild><Button variant="outline">Cancel</Button></SheetClose>
                                      <SheetClose asChild><Button onClick={handleSave}>Save Changes</Button></SheetClose>
                                    </div>
                                  </div>
                                )}
                              </SheetContent>
                            </Sheet>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPORTS TAB */}
        <TabsContent value="sports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Popular Sports</CardTitle>
                <CardDescription>Manage the sports categories displayed.</CardDescription>
              </div>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Sport</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sports.map((sport) => (
                  <Card key={sport.id} className="overflow-hidden border-border/40 relative group">
                    <div className="h-32 w-full relative">
                      <img src={sport.image} alt={sport.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <span className="text-4xl">{sport.icon}</span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="secondary" className="h-7 w-7"><Edit className="h-3 w-3" /></Button>
                         <Button size="icon" variant="destructive" className="h-7 w-7"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold">{sport.name}</h3>
                        <Switch checked={sport.visibility} />
                      </div>
                      <p className="text-xs text-muted-foreground">{sport.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROMOTIONS TAB */}
        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Promotional Banner</CardTitle>
              <CardDescription>Manage the promotional banner section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <h4 className="font-medium">Enable Promotions</h4>
                  <p className="text-sm text-muted-foreground">Show or hide the promo banner.</p>
                </div>
                <Switch checked={promos.enabled} onCheckedChange={(c) => setPromos({...promos, enabled: c})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input value={promos.heading} onChange={(e) => setPromos({...promos, heading: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={promos.description} onChange={(e) => setPromos({...promos, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input value={promos.buttonText} onChange={(e) => setPromos({...promos, buttonText: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Link</Label>
                      <Input value={promos.buttonUrl} onChange={(e) => setPromos({...promos, buttonUrl: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" value={promos.backgroundColor} onChange={(e) => setPromos({...promos, backgroundColor: e.target.value})} className="w-16 p-1 h-10" />
                      <Input value={promos.backgroundColor} onChange={(e) => setPromos({...promos, backgroundColor: e.target.value})} className="flex-1" />
                    </div>
                  </div>
                </div>
                <div className="border border-border/40 rounded-lg p-6 flex flex-col items-start justify-center" style={{ backgroundColor: promos.backgroundColor, color: 'white' }}>
                    <h3 className="text-2xl font-bold mb-2">{promos.heading}</h3>
                    <p className="mb-4 opacity-90">{promos.description}</p>
                    <Button variant="secondary">{promos.buttonText}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TESTIMONIALS TAB */}
        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Manage user reviews displayed on the home page.</CardDescription>
              </div>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Review</Button>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map(review => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <img src={review.userImage} alt={review.userName} className="w-8 h-8 rounded-full" />
                            <span className="font-medium">{review.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{review.reviewText}</TableCell>
                        <TableCell>{'⭐'.repeat(review.rating)}</TableCell>
                        <TableCell>
                           <Badge variant={review.status === 'Approved' ? 'default' : 'secondary'}>{review.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER TAB */}
        <TabsContent value="footer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
              <CardDescription>Manage global footer information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Brand Logo Text</Label>
                      <Input value={footer.logo} onChange={(e) => setFooter({...footer, logo: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>About Text</Label>
                      <Textarea value={footer.aboutText} onChange={(e) => setFooter({...footer, aboutText: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Copyright Text</Label>
                      <Input value={footer.copyright} onChange={(e) => setFooter({...footer, copyright: e.target.value})} />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="font-medium">Contact Details</h4>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={footer.email} onChange={(e) => setFooter({...footer, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={footer.phone} onChange={(e) => setFooter({...footer, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={footer.address} onChange={(e) => setFooter({...footer, address: e.target.value})} />
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </motion.div>
  );
}
