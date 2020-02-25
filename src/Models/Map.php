<?php

namespace Jdd\Pandemia\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Test model
 *
 * Swagger definition:
 *
 *  @OA\Schema(
 *      schema="MapEditable",
 *      @OA\Property(
 *          property="attributes",
 *          type="object",
 *          @OA\Property(property="map", type="string"),
 *          @OA\Property(property="lights", type="string"),
 *          @OA\Property(property="cities", type="array", @OA\Items({
 *              type="object",
 *              @OA\Property(property="x", type="int"),
 *              @OA\Property(property="y", type="int"),
 *              @OA\Property(property="value", type="int"),
 *          })),
 *          @OA\Property(property="size", type="array", @OA\Items({
 *              type="object",
 *              @OA\Property(property="width", type="int"),
 *              @OA\Property(property="height", type="int"),
 *          })),
 *      )
 *  )
 *
 *  @OA\Schema(
 *      schema="Map",
 *      allOf={
 *          @OA\Schema(
 *              @OA\Property(property="id", type="string", format="id"),
 *          ),
 *          @OA\Schema(ref="#/components/schemas/MapEditable"),
 *          @OA\Schema(
 *              @OA\Property(
 *                  property="attributes",
 *                  type="object",
 *                  @OA\Property(property="created_at", type="string", format="date-time"),
 *                  @OA\Property(property="updated_at", type="string", format="date-time"),
 *                  @OA\Property(property="id", type="string", format="id"),
 *              )
 *          )
 *      }
 *  )
 */
class Map extends Model
{
    protected $attributes = [
        'map' => '',
        'lights' => '',
    ];
    protected $fillable = [
        'map',
        'lights',
    ];
    protected $appends = [
        'cities',
        'size',
        'total',
    ];

    private $loaded = false;
    private $cities = [];
    private $total = 0;

    public function getSizeAttribute()
    {
        list($width, $height) = getimagesize($this->attributes['lights']);
        return compact('width', 'height');
    }

    private function loadCities()
    {
        if ($this->loaded) {
            return;
        }
        $img = imagecreatefrompng($this->attributes['lights']);
        $width = imagesx($img);
        $height = imagesy($img);
        $w = 8;
        $map = [];
        $max = 0;
        for ($x = 0, $xi = 0;$x < $width;$x += $w, $xi++) {
            for ($y = 0, $yi = 0;$y < $height;$y += $w,$yi++) {
                $map[$xi][$yi] = [
                    'sum' => 0,
                    'best' => ['color' => -1, 'x' => $x, 'y' => $y],
                ];
                for ($xj = $x;$xj < $x + $w;$xj++) {
                    for ($yj = $y;$yj < $y + $w;$yj++) {
                        $color = imagecolorat($img, $xj, $yj) & 0xFF;
                        $map[$xi][$yi]['sum'] += $color;
                        $map[$xi][$yi]['best']['color'] > $color ?: $map[$xi][$yi]['best'] = [
                            'color' => $color,
                            'x' => $xj,
                            'y' => $yj,
                        ];
                    }
                }
                $map[$xi][$yi]['sum'] < $max ?: $max = $map[$xi][$yi]['sum'];
            }
        }
        $points = [];
        $total = 0;
        foreach ($map as $cols) {
            foreach ($cols as $cell) {
                $value = round($cell['sum'] / $max * 100);
                if ($value > 2.5) {
                    $points[] = [
                        'x' => $cell['best']['x'],
                        'y' => $cell['best']['y'],
                        'value' => $value,
                        'infection' => 0,
                        'treatment' => 0,
                    ];
                    $total += $value;
                }
            }
        }
        $this->cities = $points;
        $this->total = $total;
        $this->loaded = true;
    }

    public function getCitiesAttribute()
    {
        $this->loadCities();
        return $this->cities;
    }

    public function getTotalAttribute()
    {
        $this->loadCities();
        return $this->total;
    }
}
