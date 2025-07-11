// components/ProjectCard.tsx
import Image from "next/image";
import { Card, CardContent, CardDescription, CardTitle, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarIcon, HeartIcon, EyeIcon, Building2Icon } from "lucide-react";

type ProjectCardProps = {
    title: string;
    address: string;
    imageUrl: string;
    issuerLogoUrl: string;
    propertyType: string;
    propertyPrice: string;
    tokenPrice: string;
    minInvestment: string;
    irr?: string;
    apr?: string;
    valueGrowth?: string;
    tokensAvailable?: string;
    visitorsThisWeek?: number;
    visitorsAllTime?: number;
    isFavorite?: boolean;
};

export default function ProjectCard({
    title,
    address,
    imageUrl,
    issuerLogoUrl,
    propertyType,
    propertyPrice,
    tokenPrice,
    minInvestment,
    irr,
    apr,
    valueGrowth,
    tokensAvailable,
    visitorsThisWeek,
    visitorsAllTime,
    isFavorite = false,
}: ProjectCardProps) {
    return (
        <Card className="w-[500px] shadow-md">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{address}</CardDescription>
         </CardHeader>
         <CardContent>
                           <div className="flex items-center gap-2 mt-1">
                    <Image src={issuerLogoUrl} alt="Issuer logo" width={24} height={24} />
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2Icon className="w-4 h-4" />
                        {propertyType}
                    </div>
                </div>

                {/* Property price */}
                <div className="flex justify-between pt-3 border-t text-sm font-medium">
                    <span className="text-muted-foreground">Property price</span>
                    <span>{propertyPrice}</span>
                </div>

                {/* Token economics */}
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Token price</span>
                        <span className="font-semibold">{tokenPrice}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Min inv.</span>
                        <span className="font-semibold">{minInvestment}</span>
                    </div>
                    {irr && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IRR</span>
                            <span className="font-semibold">{irr}</span>
                        </div>
                    )}
                    {valueGrowth && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Value growth</span>
                            <span className="font-semibold">{valueGrowth}</span>
                        </div>
                    )}
                    {apr && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">APR</span>
                            <span className="font-semibold">{apr}</span>
                        </div>
                    )}
                    {tokensAvailable && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tokens avail.</span>
                            <span className="font-semibold">{tokensAvailable}</span>
                        </div>
                    )}
                </div>

                {/* Visitors */}
                <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                    <div className="flex justify-between">
                        <div className="flex gap-1 items-center">
                            <EyeIcon className="w-4 h-4 text-green-600" />
                            {visitorsThisWeek ? `Visited ${visitorsThisWeek}x this week` : "—"}
                        </div>
                        <span>{visitorsAllTime} all time</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between gap-2 mt-3">
                    <Button variant="outline" className="w-full text-xs py-2">
                        Details
                    </Button>
                    <Button variant="default" className="w-full text-xs py-2">
                        Buy Tokens
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

